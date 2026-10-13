from __future__ import annotations

import inspect
from typing import Any, Callable

from ..base.agent import BaseAgent
from ..models import AgentContext, AgentRequest
from .generator import CodeGenerator, GeneratedCode
from .reviewer import CodeReviewer, ReviewResult
from .utils import detect_language, validate_coding_request


class CodingAgent(BaseAgent):
    """Generate code with an injected generator and optional reviewer."""

    def __init__(
        self,
        generator: CodeGenerator | Callable[..., Any],
        reviewer: CodeReviewer | None = None,
        *,
        agent_id: str = "coding-agent",
        name: str = "ModelNow Coding Agent",
        review_generated_code: bool = True,
    ) -> None:
        super().__init__(agent_id=agent_id, name=name)

        if not callable(generator) and not callable(
            getattr(generator, "generate", None)
        ):
            raise TypeError("generator must be callable or provide generate()")

        if reviewer is not None and not callable(
            getattr(reviewer, "review", None)
        ):
            raise TypeError("reviewer must provide review()")

        self.generator = generator
        self.reviewer = reviewer
        self.review_generated_code = review_generated_code

    async def _generate(self, prompt: str, language: str) -> GeneratedCode:
        target = getattr(self.generator, "generate", self.generator)
        result = target(prompt, language=language)

        if inspect.isawaitable(result):
            result = await result

        if isinstance(result, GeneratedCode):
            return result

        if isinstance(result, str):
            return GeneratedCode(code=result, language=language)

        raise TypeError("generator must return a string or GeneratedCode")

    async def _review(self, code: str, language: str) -> ReviewResult:
        if self.reviewer is None:
            return ReviewResult()

        result = self.reviewer.review(code, language=language)

        if inspect.isawaitable(result):
            result = await result

        if isinstance(result, ReviewResult):
            return result

        if isinstance(result, str):
            return ReviewResult(summary=result)

        raise TypeError("reviewer must return ReviewResult or string")

    async def execute(
        self,
        request: AgentRequest,
        context: AgentContext,
    ) -> str:
        prompt = validate_coding_request(request.input)

        requested_language = request.metadata.get(
            "language",
            context.metadata.get("language", "python"),
        )
        language = detect_language(requested_language)

        generated = await self._generate(prompt, language)
        code = generated.code.strip()

        if not code:
            raise ValueError("The code generator returned empty code")

        output_language = detect_language(generated.language)
        review = ReviewResult()

        if self.review_generated_code and self.reviewer is not None:
            review = await self._review(code, output_language)

        sections = [
            f"Language: {output_language}",
            "",
            "Generated code:",
            f"```{output_language}",
            code,
            "```",
        ]

        if generated.explanation:
            sections.extend(["", "Explanation:", generated.explanation.strip()])

        if self.review_generated_code and self.reviewer is not None:
            sections.extend([
                "",
                "Code review:",
                review.summary or "Review completed.",
            ])

            if review.issues:
                sections.extend(["", "Review findings:"])
                sections.extend(f"- {issue}" for issue in review.issues)

            if review.suggestions:
                sections.extend(["", "Suggestions:"])
                sections.extend(
                    f"- {suggestion}" for suggestion in review.suggestions
                )

        sections.extend(["", "Safety: Generated code was not executed."])
        return "\n".join(sections)


__all__ = ["CodingAgent"]
