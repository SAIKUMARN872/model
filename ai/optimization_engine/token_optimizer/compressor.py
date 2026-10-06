from __future__ import annotations

from dataclasses import dataclass

from .reducer import TokenReducer, create_default_reducer
from .utils import validate_text


@dataclass(frozen=True)
class CompressionResult:
    original_text: str
    compressed_text: str
    original_characters: int
    compressed_characters: int
    characters_saved: int
    compression_ratio: float


class TextCompressor:
    """Conservative text compressor for token optimization."""

    def __init__(self, reducer: TokenReducer | None = None) -> None:
        self.reducer = reducer or create_default_reducer()

    def remove_duplicate_lines(self, text: str) -> str:
        text = validate_text(text)

        seen: set[str] = set()
        result: list[str] = []

        for line in text.splitlines():
            normalized = line.strip()

            if not normalized:
                result.append("")
                continue

            if normalized in seen:
                continue

            seen.add(normalized)
            result.append(line.rstrip())

        return "\n".join(result)

    def compress(self, text: str) -> CompressionResult:
        text = validate_text(text)

        reduced = self.reducer.reduce(text)
        compressed = self.remove_duplicate_lines(
            reduced.optimized_text
        )

        original_characters = len(text)
        compressed_characters = len(compressed)
        characters_saved = max(
            original_characters - compressed_characters,
            0,
        )

        if original_characters == 0:
            compression_ratio = 1.0
        else:
            compression_ratio = (
                compressed_characters / original_characters
            )

        return CompressionResult(
            original_text=text,
            compressed_text=compressed,
            original_characters=original_characters,
            compressed_characters=compressed_characters,
            characters_saved=characters_saved,
            compression_ratio=compression_ratio,
        )

    def should_compress(
        self,
        text: str,
        minimum_savings: int = 1,
    ) -> bool:
        text = validate_text(text)

        if minimum_savings < 0:
            raise ValueError("minimum_savings must be non-negative")

        result = self.compress(text)

        return result.characters_saved >= minimum_savings


def create_default_compressor() -> TextCompressor:
    return TextCompressor()


__all__ = [
    "CompressionResult",
    "TextCompressor",
    "create_default_compressor",
]
