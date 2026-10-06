from __future__ import annotations

import re
from dataclasses import dataclass

from .utils import (
    calculate_reduction,
    normalize_text,
    validate_text,
)


@dataclass(frozen=True)
class ReductionResult:
    original_text: str
    optimized_text: str
    original_characters: int
    optimized_characters: int
    characters_saved: int


class TokenReducer:
    """Performs conservative text reductions."""

    def normalize_whitespace(self, text: str) -> str:
        return normalize_text(text)

    def remove_redundant_blank_lines(self, text: str) -> str:
        text = validate_text(text)

        return re.sub(r"\n[ \t]*\n(?:[ \t]*\n)+", "\n\n", text)

    def reduce_spaces(self, text: str) -> str:
        text = validate_text(text)

        lines = text.splitlines()

        cleaned = [
            re.sub(r"[ \t]+", " ", line).strip()
            for line in lines
        ]

        return "\n".join(cleaned)

    def reduce(self, text: str) -> ReductionResult:
        text = validate_text(text)

        optimized = self.remove_redundant_blank_lines(text)
        optimized = self.reduce_spaces(optimized)

        original_characters = len(text)
        optimized_characters = len(optimized)

        return ReductionResult(
            original_text=text,
            optimized_text=optimized,
            original_characters=original_characters,
            optimized_characters=optimized_characters,
            characters_saved=calculate_reduction(
                original_characters,
                optimized_characters,
            ),
        )

    def is_reduced(self, original_text: str, optimized_text: str) -> bool:
        original_text = validate_text(original_text)
        optimized_text = validate_text(optimized_text)

        return len(optimized_text) < len(original_text)


def create_default_reducer() -> TokenReducer:
    return TokenReducer()


__all__ = [
    "ReductionResult",
    "TokenReducer",
    "create_default_reducer",
]
