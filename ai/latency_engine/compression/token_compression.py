from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CompressionResult:
    """Result of compressing a text payload."""

    original_text: str
    compressed_text: str
    original_characters: int
    compressed_characters: int
    compression_ratio: float
    reduction_percent: float

    @property
    def reduced(self) -> bool:
        return (
            self.compressed_characters
            < self.original_characters
        )


class TokenCompressor:
    """Deterministic text compressor for latency optimization."""

    def __init__(
        self,
        max_reduction_percent: float = 40.0,
    ) -> None:
        if not 0.0 <= max_reduction_percent <= 100.0:
            raise ValueError(
                "max_reduction_percent must be between 0 and 100"
            )

        self._max_reduction_percent = float(
            max_reduction_percent
        )

    @property
    def max_reduction_percent(self) -> float:
        return self._max_reduction_percent

    def normalize_whitespace(
        self,
        text: str,
    ) -> str:
        """Collapse repeated whitespace."""
        return " ".join(str(text).split())

    def remove_empty_lines(
        self,
        text: str,
    ) -> str:
        """Remove blank lines while preserving content."""
        lines = [
            line.strip()
            for line in str(text).splitlines()
            if line.strip()
        ]

        return "\n".join(lines)

    def compress(
        self,
        text: str,
    ) -> CompressionResult:
        """Apply safe deterministic compression."""

        original = str(text)

        if not original:
            return CompressionResult(
                original_text="",
                compressed_text="",
                original_characters=0,
                compressed_characters=0,
                compression_ratio=1.0,
                reduction_percent=0.0,
            )

        compressed = self.remove_empty_lines(
            self.normalize_whitespace(original)
        )

        original_length = len(original)
        compressed_length = len(compressed)

        maximum_allowed_reduction = (
            self._max_reduction_percent
            / 100.0
        )

        minimum_allowed_length = int(
            original_length
            * (1.0 - maximum_allowed_reduction)
        )

        if (
            compressed_length < minimum_allowed_length
            and original_length > 0
        ):
            compressed = compressed[:minimum_allowed_length]
            compressed_length = len(compressed)

        reduction_percent = (
            (
                original_length
                - compressed_length
            )
            / original_length
            * 100.0
        )

        ratio = (
            compressed_length / original_length
            if original_length
            else 1.0
        )

        return CompressionResult(
            original_text=original,
            compressed_text=compressed,
            original_characters=original_length,
            compressed_characters=compressed_length,
            compression_ratio=ratio,
            reduction_percent=reduction_percent,
        )

    def compress_messages(
        self,
        messages: list[dict[str, object]],
    ) -> list[dict[str, object]]:
        """Compress textual message content."""

        compressed_messages: list[dict[str, object]] = []

        for message in messages:
            updated = dict(message)
            content = updated.get("content")

            if isinstance(content, str):
                updated["content"] = self.compress(
                    content
                ).compressed_text

            compressed_messages.append(updated)

        return compressed_messages


__all__ = [
    "CompressionResult",
    "TokenCompressor",
]
