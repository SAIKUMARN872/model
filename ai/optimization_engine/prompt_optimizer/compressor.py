from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .utils import (
    calculate_reduction,
    calculate_reduction_percent,
    calculate_reduction_ratio,
    normalize_prompt,
    remove_repeated_blank_lines,
    remove_repeated_spaces,
)


@dataclass(frozen=True)
class PromptCompressionResult:
    original_prompt: str
    compressed_prompt: str
    original_characters: int
    compressed_characters: int
    characters_saved: int
    reduction_ratio: Decimal
    reduction_percent: Decimal
    changed: bool


class PromptCompressor:
    def __init__(
        self,
        *,
        normalize_whitespace: bool = True,
        remove_blank_lines: bool = True,
    ) -> None:
        self.normalize_whitespace = normalize_whitespace
        self.remove_blank_lines = remove_blank_lines

    def compress(
        self,
        prompt: str,
    ) -> PromptCompressionResult:
        if not isinstance(prompt, str):
            raise TypeError("prompt must be a string")

        original = prompt
        compressed = prompt

        if self.normalize_whitespace:
            compressed = normalize_prompt(compressed)
            compressed = remove_repeated_spaces(compressed)

        if self.remove_blank_lines:
            compressed = remove_repeated_blank_lines(compressed)

        compressed = self._normalize_lines(compressed)
        compressed = compressed.strip()

        original_characters = len(original)
        compressed_characters = len(compressed)

        characters_saved = calculate_reduction(
            original_characters,
            compressed_characters,
        )

        reduction_ratio = calculate_reduction_ratio(
            original_characters,
            compressed_characters,
        )

        reduction_percent = calculate_reduction_percent(
            original_characters,
            compressed_characters,
        )

        return PromptCompressionResult(
            original_prompt=original,
            compressed_prompt=compressed,
            original_characters=original_characters,
            compressed_characters=compressed_characters,
            characters_saved=characters_saved,
            reduction_ratio=reduction_ratio,
            reduction_percent=reduction_percent,
            changed=original != compressed,
        )

    @staticmethod
    def _normalize_lines(prompt: str) -> str:
        lines = [
            line.strip()
            for line in prompt.splitlines()
        ]

        return "\n".join(
            line
            for line in lines
            if line
        )

    def should_compress(
        self,
        prompt: str,
        *,
        minimum_reduction_percent: float = 5.0,
    ) -> bool:
        if minimum_reduction_percent < 0:
            raise ValueError(
                "minimum_reduction_percent must be non-negative"
            )

        result = self.compress(prompt)

        return (
            result.changed
            and result.reduction_percent
            >= Decimal(str(minimum_reduction_percent))
        )


def create_default_compressor() -> PromptCompressor:
    return PromptCompressor()


__all__ = [
    "PromptCompressionResult",
    "PromptCompressor",
    "create_default_compressor",
]
