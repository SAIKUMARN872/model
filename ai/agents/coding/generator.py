from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GeneratedCode:
    """Normalized code-generation result."""

    code: str
    language: str = "python"
    explanation: str = ""

    def __post_init__(self) -> None:
        if not isinstance(self.code, str):
            raise TypeError("code must be a string")

        if not isinstance(self.language, str) or not self.language.strip():
            raise ValueError("language must be a non-empty string")

        if not isinstance(self.explanation, str):
            raise TypeError("explanation must be a string")


class CodeGenerator:
    """Base contract for a model-backed code generator."""

    async def generate(
        self,
        prompt: str,
        *,
        language: str = "python",
    ) -> GeneratedCode:
        raise NotImplementedError(
            "Implement generate() in a provider-specific generator"
        )


__all__ = ["CodeGenerator", "GeneratedCode"]
