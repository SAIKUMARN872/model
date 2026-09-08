"""
Main coding agent for ModelNow.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from agents.base import (
    BaseAgent,
    BaseAgentConfig,
    BaseAgentContext,
    BaseAgentState,
)

from .generator import (
    CodeGenerationRequest,
    CodeGenerator,
)
from .reviewer import (
    CodeReviewRequest,
    CodeReviewResult,
    CodeReviewer,
)
from .utils import (
    normalize_language,
)


class CodingAgentError(Exception):
    """Base coding-agent error."""


class CodingAgentConfigurationError(
    CodingAgentError
):
    """Invalid coding-agent configuration."""


@dataclass
class CodingAgentConfig:
    """
    Configuration for CodingAgent.
    """

    name: str = "coding-agent"

    description: str = (
        "ModelNow code generation and review agent"
    )

    system_prompt: str = (
        "You are a professional software "
        "engineering assistant. Generate clean, "
        "maintainable and executable code."
    )

    language: str = "python"

    max_iterations: int = 10

    review_generated_code: bool = True

    auto_fix: bool = False

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if self.max_iterations <= 0:
            raise ValueError(
                "max_iterations must be positive"
            )

        self.language = normalize_language(
            self.language
        )


class CodingAgent(BaseAgent):
    """
    Specialized ModelNow agent for software engineering.

    It supports:

        - code generation
        - code review
        - syntax validation
        - optional automatic correction
        - tool execution
    """

    def __init__(
        self,
        config: CodingAgentConfig | None = None,
        generation_handler: Callable[
            ...,
            Any,
        ] | None = None,
        review_handler: Callable[
            ...,
            Any,
        ] | None = None,
        tools: dict[
            str,
            Callable[..., Any],
        ] | None = None,
    ) -> None:

        config = (
            config
            or CodingAgentConfig()
        )

        self.coding_config = config

        self.generator = CodeGenerator(
            handler=generation_handler
        )

        self.reviewer = CodeReviewer(
            handler=review_handler
        )

        super().__init__(
            config=BaseAgentConfig(
                name=config.name,
                description=config.description,
                system_prompt=config.system_prompt,
                max_iterations=config.max_iterations,
                metadata=config.metadata,
            ),
            tools=tools,
        )

    async def execute(
        self,
        context: BaseAgentContext,
        state: BaseAgentState,
    ) -> Any:
        """
        Execute a coding request.

        The user request is passed to the configured
        code generation provider.
        """

        request = CodeGenerationRequest(
            prompt=context.user_input,
            language=self.coding_config.language,
            metadata=context.metadata,
        )

        result = await self.generator.generate(
            request
        )

        if not result.success:

            raise CodingAgentError(
                result.error
                or "Code generation failed"
            )

        if (
            self.coding_config.review_generated_code
            and result.code
        ):

            review = await self.review_code(
                code=result.code,
                language=result.language,
                filename=result.filename,
                metadata=context.metadata,
            )

            context.set(
                "code_review",
                review.to_dict(),
            )

            if (
                not review.success
                and self.coding_config.auto_fix
                and review.corrected_code
            ):

                result.code = (
                    review.corrected_code
                )

        context.set(
            "generated_code",
            result.code,
        )

        return self.format_result(
            result,
            context,
        )

    async def generate_code(
        self,
        prompt: str,
        language: str | None = None,
        filename: str | None = None,
        requirements: list[str] | None = None,
    ):

        request = CodeGenerationRequest(
            prompt=prompt,
            language=normalize_language(
                language
                or self.coding_config.language
            ),
            filename=filename,
            requirements=(
                requirements or []
            ),
        )

        return await self.generator.generate(
            request
        )

    async def review_code(
        self,
        code: str,
        language: str | None = None,
        filename: str | None = None,
        requirements: list[str] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> CodeReviewResult:

        request = CodeReviewRequest(
            code=code,
            language=normalize_language(
                language
                or self.coding_config.language
            ),
            filename=filename,
            requirements=(
                requirements or []
            ),
            metadata=metadata or {},
        )

        return await self.reviewer.review(
            request
        )

    async def generate_and_review(
        self,
        prompt: str,
        language: str | None = None,
        filename: str | None = None,
        requirements: list[str] | None = None,
    ) -> dict[str, Any]:

        generation = await self.generate_code(
            prompt=prompt,
            language=language,
            filename=filename,
            requirements=requirements,
        )

        if not generation.success:

            return {
                "success": False,
                "generation": generation.to_dict(),
                "review": None,
            }

        review = await self.review_code(
            code=generation.code,
            language=generation.language,
            filename=filename,
            requirements=requirements,
        )

        return {
            "success": review.success,
            "generation": generation.to_dict(),
            "review": review.to_dict(),
        }

    @staticmethod
    def format_result(
        result,
        context: BaseAgentContext,
    ) -> str:

        code = result.code

        if not code:
            return "No code was generated."

        language = result.language

        filename = (
            result.filename
            or "generated_code"
        )

        return (
            f"Generated code: {filename}\n\n"
            f"```{language}\n"
            f"{code}\n"
            f"```"
        )