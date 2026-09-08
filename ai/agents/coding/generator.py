"""
Code generation utilities for ModelNow.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable


class CodeGenerationError(Exception):
    """Base exception for code generation."""


@dataclass
class CodeGenerationRequest:
    """
    Represents a code generation request.
    """

    prompt: str

    language: str = "python"

    filename: str | None = None

    existing_code: str | None = None

    requirements: list[str] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.prompt.strip():
            raise ValueError(
                "Generation prompt cannot be empty"
            )

        if not self.language.strip():
            raise ValueError(
                "Language cannot be empty"
            )


@dataclass
class CodeGenerationResult:
    """
    Result returned by the code generator.
    """

    code: str

    language: str

    filename: str | None = None

    explanation: str = ""

    success: bool = True

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "code": self.code,
            "language": self.language,
            "filename": self.filename,
            "explanation": self.explanation,
            "success": self.success,
            "error": self.error,
            "metadata": dict(self.metadata),
        }


class CodeGenerator:
    """
    Generic code generator.

    The actual LLM/provider can be injected through
    the `handler` argument.

    Handler signature:

        handler(request) -> str | dict
    """

    def __init__(
        self,
        handler: Callable[..., Any] | None = None,
    ) -> None:

        self.handler = handler

    def build_prompt(
        self,
        request: CodeGenerationRequest,
    ) -> str:

        parts = [
            "Generate production-quality code.",
            "",
            f"Language: {request.language}",
            f"Task: {request.prompt}",
        ]

        if request.filename:
            parts.append(
                f"Filename: {request.filename}"
            )

        if request.existing_code:

            parts.extend(
                [
                    "",
                    "Existing code:",
                    request.existing_code,
                ]
            )

        if request.requirements:

            parts.extend(
                [
                    "",
                    "Requirements:",
                ]
            )

            parts.extend(
                f"- {item}"
                for item in request.requirements
            )

        parts.extend(
            [
                "",
                "Return executable code.",
                "Avoid unnecessary dependencies.",
                "Use clear structure and error handling.",
            ]
        )

        return "\n".join(parts)

    async def generate(
        self,
        request: CodeGenerationRequest,
    ) -> CodeGenerationResult:

        if self.handler is None:

            return CodeGenerationResult(
                code="",
                language=request.language,
                filename=request.filename,
                success=False,
                error=(
                    "No code generation handler configured"
                ),
            )

        try:

            from .utils import execute_handler

            result = await execute_handler(
                self.handler,
                request,
            )

            code = self._extract_code(
                result
            )

            return CodeGenerationResult(
                code=code,
                language=request.language,
                filename=request.filename,
                explanation=(
                    self._extract_explanation(
                        result
                    )
                ),
                success=True,
                metadata=request.metadata,
            )

        except Exception as exc:

            return CodeGenerationResult(
                code="",
                language=request.language,
                filename=request.filename,
                success=False,
                error=str(exc),
            )

    def _extract_code(
        self,
        result: Any,
    ) -> str:

        if isinstance(result, str):
            return self.clean_code(result)

        if isinstance(result, dict):

            code = result.get(
                "code",
                result.get(
                    "output",
                    "",
                ),
            )

            return self.clean_code(
                code
            )

        return self.clean_code(
            str(result)
        )

    @staticmethod
    def _extract_explanation(
        result: Any,
    ) -> str:

        if isinstance(result, dict):

            return str(
                result.get(
                    "explanation",
                    "",
                )
            )

        return ""

    @staticmethod
    def clean_code(
        code: str,
    ) -> str:

        code = code.strip()

        if code.startswith("```"):

            lines = code.splitlines()

            if lines:
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            code = "\n".join(lines)

        return code.strip()

    async def generate_from_prompt(
        self,
        prompt: str,
        language: str = "python",
        filename: str | None = None,
        requirements: list[str] | None = None,
    ) -> CodeGenerationResult:

        request = CodeGenerationRequest(
            prompt=prompt,
            language=language,
            filename=filename,
            requirements=requirements or [],
        )

        return await self.generate(
            request
        )