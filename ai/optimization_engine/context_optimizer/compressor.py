from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .utils import (
    calculate_reduction,
    calculate_reduction_percent,
    calculate_reduction_ratio,
    deduplicate_lines,
    normalize_context,
)


@dataclass(frozen=True)
class ContextCompressionResult:
    original_context: str
    compressed_context: str
    original_characters: int
    compressed_characters: int
    characters_saved: int
    reduction_ratio: Decimal
    reduction_percent: Decimal
    changed: bool


class ContextCompressor:
    """Compress context while preserving useful textual content."""

    def __init__(
        self,
        *,
        remove_duplicates: bool = True,
        normalize_whitespace: bool = True,
    ) -> None:
        self.remove_duplicates = remove_duplicates
        self.normalize_whitespace = normalize_whitespace

    def compress(self, context: str) -> ContextCompressionResult:
        if not isinstance(context, str):
            raise TypeError("context must be a string")

        original = context

        if self.normalize_whitespace:
            normalized = normalize_context(context)
        else:
            normalized = context

        lines = normalized.split("\n")

        if self.remove_duplicates:
            lines = deduplicate_lines(lines)

        compressed = "\n".join(lines)

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

        return ContextCompressionResult(
            original_context=original,
            compressed_context=compressed,
            original_characters=original_characters,
            compressed_characters=compressed_characters,
            characters_saved=characters_saved,
            reduction_ratio=reduction_ratio,
            reduction_percent=reduction_percent,
            changed=original != compressed,
        )

    def should_compress(
        self,
        context: str,
        *,
        minimum_reduction_percent: float = 5.0,
    ) -> bool:
        if minimum_reduction_percent < 0:
            raise ValueError("minimum_reduction_percent must be non-negative")

        result = self.compress(context)

        return (
            result.changed
            and result.reduction_percent >= Decimal(str(minimum_reduction_percent))
        )


def create_default_compressor() -> ContextCompressor:
    """Create the default context compressor."""
    return ContextCompressor()


__all__ = [
    "ContextCompressionResult",
    "ContextCompressor",
    "create_default_compressor",
]
