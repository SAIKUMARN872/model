from __future__ import annotations

from dataclasses import dataclass
from threading import RLock
from typing import Any

from .utils import (
    DEFAULT_MAX_BUFFER_SIZE,
    chunk_size_bytes,
    estimate_tokens,
    normalize_chunk,
    validate_buffer_size,
)


@dataclass(frozen=True)
class BufferSnapshot:
    chunks: tuple[str, ...]
    total_bytes: int
    total_tokens: int
    closed: bool

    @property
    def size(self) -> int:
        return len(self.chunks)

    @property
    def empty(self) -> bool:
        return not self.chunks

    @property
    def text(self) -> str:
        return "".join(self.chunks)


class StreamBuffer:
    def __init__(
        self,
        *,
        max_buffer_size: int = DEFAULT_MAX_BUFFER_SIZE,
    ) -> None:
        self._max_buffer_size = validate_buffer_size(
            max_buffer_size
        )
        self._chunks: list[str] = []
        self._total_bytes = 0
        self._total_tokens = 0
        self._closed = False
        self._lock = RLock()

    @property
    def max_buffer_size(self) -> int:
        return self._max_buffer_size

    @property
    def size(self) -> int:
        with self._lock:
            return len(self._chunks)

    @property
    def total_bytes(self) -> int:
        with self._lock:
            return self._total_bytes

    @property
    def total_tokens(self) -> int:
        with self._lock:
            return self._total_tokens

    @property
    def closed(self) -> bool:
        with self._lock:
            return self._closed

    @property
    def empty(self) -> bool:
        with self._lock:
            return not self._chunks

    def append(self, chunk: Any) -> str:
        normalized = normalize_chunk(chunk)

        if not normalized:
            return ""

        size_bytes = chunk_size_bytes(normalized)

        with self._lock:
            if self._closed:
                raise RuntimeError(
                    "buffer is closed"
                )

            if (
                self._total_bytes + size_bytes
                > self._max_buffer_size
            ):
                raise BufferError(
                    "stream buffer size limit exceeded"
                )

            self._chunks.append(normalized)
            self._total_bytes += size_bytes
            self._total_tokens += estimate_tokens(
                normalized
            )

        return normalized

    def extend(self, chunks: list[Any] | tuple[Any, ...]) -> int:
        count = 0

        for chunk in chunks:
            self.append(chunk)
            count += 1

        return count

    def snapshot(self) -> BufferSnapshot:
        with self._lock:
            return BufferSnapshot(
                chunks=tuple(self._chunks),
                total_bytes=self._total_bytes,
                total_tokens=self._total_tokens,
                closed=self._closed,
            )

    def text(self) -> str:
        with self._lock:
            return "".join(self._chunks)

    def clear(self) -> None:
        with self._lock:
            if self._closed:
                raise RuntimeError(
                    "buffer is closed"
                )

            self._chunks.clear()
            self._total_bytes = 0
            self._total_tokens = 0

    def close(self) -> None:
        with self._lock:
            self._closed = True

    def reopen(self) -> None:
        with self._lock:
            self._closed = False


__all__ = [
    "BufferSnapshot",
    "StreamBuffer",
]
