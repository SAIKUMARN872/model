"""Streaming response utilities for ModelNow optimization."""

from __future__ import annotations

from collections.abc import Iterable, Iterator
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class StreamChunk:
    """A normalized response stream chunk."""

    index: int
    content: str
    is_final: bool = False
    metadata: dict[str, Any] | None = None

    def __post_init__(self) -> None:
        if self.index < 0:
            raise ValueError("index must be non-negative")

        if not isinstance(self.content, str):
            raise TypeError("content must be a string")

        if self.metadata is not None:
            object.__setattr__(self, "metadata", dict(self.metadata))

    def as_dict(self) -> dict[str, Any]:
        """Return a serializable representation."""
        return {
            "index": self.index,
            "content": self.content,
            "is_final": self.is_final,
            "metadata": dict(self.metadata or {}),
        }


class ResponseStreamer:
    """Normalize and process response streams."""

    def __init__(self, *, chunk_size: int = 256) -> None:
        if not isinstance(chunk_size, int) or chunk_size <= 0:
            raise ValueError("chunk_size must be a positive integer")

        self.chunk_size = chunk_size

    def chunk_text(self, text: str) -> Iterator[StreamChunk]:
        """Split text into deterministic stream chunks."""
        if not isinstance(text, str):
            raise TypeError("text must be a string")

        if not text:
            yield StreamChunk(index=0, content="", is_final=True)
            return

        chunks = [
            text[index:index + self.chunk_size]
            for index in range(0, len(text), self.chunk_size)
        ]

        for index, content in enumerate(chunks):
            yield StreamChunk(
                index=index,
                content=content,
                is_final=index == len(chunks) - 1,
            )

    def normalize(
        self,
        chunks: Iterable[Any],
    ) -> Iterator[StreamChunk]:
        """Normalize arbitrary stream chunks."""
        for index, chunk in enumerate(chunks):
            if isinstance(chunk, StreamChunk):
                yield StreamChunk(
                    index=index,
                    content=chunk.content,
                    is_final=chunk.is_final,
                    metadata=chunk.metadata,
                )
                continue

            if isinstance(chunk, str):
                yield StreamChunk(
                    index=index,
                    content=chunk,
                    is_final=False,
                )
                continue

            if isinstance(chunk, dict):
                content = chunk.get("content", chunk.get("text", ""))
                yield StreamChunk(
                    index=index,
                    content=str(content),
                    is_final=bool(chunk.get("is_final", False)),
                    metadata=chunk.get("metadata"),
                )
                continue

            yield StreamChunk(
                index=index,
                content=str(chunk),
                is_final=False,
            )

    def collect(self, chunks: Iterable[Any]) -> str:
        """Collect stream chunks into a single response."""
        return "".join(chunk.content for chunk in self.normalize(chunks))

    def stream_with_final(
        self,
        chunks: Iterable[Any],
    ) -> Iterator[StreamChunk]:
        """Normalize a stream and guarantee a final chunk marker."""
        normalized = list(self.normalize(chunks))

        if not normalized:
            yield StreamChunk(index=0, content="", is_final=True)
            return

        for index, chunk in enumerate(normalized):
            yield StreamChunk(
                index=index,
                content=chunk.content,
                is_final=index == len(normalized) - 1,
                metadata=chunk.metadata,
            )


def stream_response(
    text: str,
    *,
    chunk_size: int = 256,
) -> Iterator[StreamChunk]:
    """Convenience function for streaming response text."""
    return ResponseStreamer(chunk_size=chunk_size).chunk_text(text)


def collect_response(chunks: Iterable[Any]) -> str:
    """Convenience function for collecting response chunks."""
    return ResponseStreamer().collect(chunks)


__all__ = [
    "ResponseStreamer",
    "StreamChunk",
    "collect_response",
    "stream_response",
]
