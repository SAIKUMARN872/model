from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .token_compression import (
    CompressionResult,
    TokenCompressor,
)
from .utils import (
    estimate_message_tokens,
    estimate_tokens,
)


@dataclass(frozen=True)
class MessageCompressionResult:
    """Result of compressing an inference message collection."""

    original_messages: list[dict[str, Any]]
    compressed_messages: list[dict[str, Any]]
    original_tokens: int
    compressed_tokens: int
    tokens_saved: int
    reduction_percent: float


class RequestCompressor:
    """Compress inference requests for lower latency."""

    def __init__(
        self,
        compressor: TokenCompressor | None = None,
    ) -> None:
        self._compressor = (
            compressor
            if compressor is not None
            else TokenCompressor()
        )

    @property
    def compressor(self) -> TokenCompressor:
        return self._compressor

    def compress_text(
        self,
        text: str,
    ) -> CompressionResult:
        """Compress a single text payload."""
        return self._compressor.compress(text)

    def compress_messages(
        self,
        messages: list[dict[str, object]],
    ) -> MessageCompressionResult:
        """Compress all textual message content."""

        original = [
            dict(message)
            for message in messages
        ]

        compressed = self._compressor.compress_messages(
            original
        )

        original_tokens = estimate_message_tokens(
            original
        )

        compressed_tokens = estimate_message_tokens(
            compressed
        )

        tokens_saved = max(
            0,
            original_tokens - compressed_tokens,
        )

        reduction = (
            (
                original_tokens
                - compressed_tokens
            )
            / original_tokens
            * 100.0
            if original_tokens
            else 0.0
        )

        return MessageCompressionResult(
            original_messages=original,
            compressed_messages=compressed,
            original_tokens=original_tokens,
            compressed_tokens=compressed_tokens,
            tokens_saved=tokens_saved,
            reduction_percent=reduction,
        )

    def estimate_text_tokens(
        self,
        text: str,
    ) -> int:
        """Estimate tokens for a text payload."""
        return estimate_tokens(text)

    def estimate_messages_tokens(
        self,
        messages: list[dict[str, object]],
    ) -> int:
        """Estimate tokens for message content."""
        return estimate_message_tokens(messages)


__all__ = [
    "MessageCompressionResult",
    "RequestCompressor",
]
