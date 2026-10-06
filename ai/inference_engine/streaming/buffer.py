from __future__ import annotations

from dataclasses import dataclass


@dataclass
class StreamBuffer:
    """Accumulate streamed content."""

    _chunks: list[str] = None

    def __post_init__(self) -> None:
        if self._chunks is None:
            self._chunks = []

    def append(self, content: str) -> None:
        self._chunks.append(content)

    def get_content(self) -> str:
        return "".join(self._chunks)

    def clear(self) -> None:
        self._chunks.clear()

    @property
    def chunk_count(self) -> int:
        return len(self._chunks)


__all__ = ["StreamBuffer"]
