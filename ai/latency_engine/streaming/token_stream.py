from __future__ import annotations

from dataclasses import dataclass
from threading import RLock
from typing import Any, Iterable, Iterator

from .buffer import StreamBuffer
from .utils import (
    DEFAULT_MAX_BUFFER_SIZE,
    chunk_size_bytes,
    estimate_tokens,
)


@dataclass(frozen=True)
class TokenStreamSnapshot:
    chunks: tuple[str, ...]
    total_tokens: int
    total_bytes: int
    completed: bool
    failed: bool
    error: str | None = None

    @property
    def text(self) -> str:
        return "".join(self.chunks)

    @property
    def size(self) -> int:
        return len(self.chunks)


class TokenStream:
    def __init__(
        self,
        *,
        max_buffer_size: int = DEFAULT_MAX_BUFFER_SIZE,
    ) -> None:
        self._buffer = StreamBuffer(
            max_buffer_size=max_buffer_size
        )
        self._chunks: list[str] = []
        self._total_tokens = 0
        self._total_bytes = 0
        self._completed = False
        self._failed = False
        self._error: str | None = None
        self._lock = RLock()

    @property
    def completed(self) -> bool:
        with self._lock:
            return self._completed

    @property
    def failed(self) -> bool:
        with self._lock:
            return self._failed

    @property
    def total_tokens(self) -> int:
        with self._lock:
            return self._total_tokens

    @property
    def total_bytes(self) -> int:
        with self._lock:
            return self._total_bytes

    @property
    def size(self) -> int:
        with self._lock:
            return len(self._chunks)

    @property
    def error(self) -> str | None:
        with self._lock:
            return self._error

    def push(self, chunk: Any) -> str:
        with self._lock:
            if self._completed:
                raise RuntimeError(
                    "stream is already completed"
                )

            if self._failed:
                raise RuntimeError(
                    "stream has failed"
                )

            normalized = self._buffer.append(chunk)

            if not normalized:
                return ""

            self._chunks.append(normalized)
            self._total_tokens += estimate_tokens(
                normalized
            )
            self._total_bytes += chunk_size_bytes(
                normalized
            )

            return normalized

    def push_many(
        self,
        chunks: Iterable[Any],
    ) -> int:
        count = 0

        for chunk in chunks:
            self.push(chunk)
            count += 1

        return count

    def complete(self) -> None:
        with self._lock:
            if self._failed:
                raise RuntimeError(
                    "failed stream cannot be completed"
                )

            self._completed = True
            self._buffer.close()

    def fail(self, error: str | Exception) -> None:
        with self._lock:
            if self._completed:
                raise RuntimeError(
                    "completed stream cannot fail"
                )

            self._failed = True
            self._error = str(error)
            self._buffer.close()

    def snapshot(self) -> TokenStreamSnapshot:
        with self._lock:
            return TokenStreamSnapshot(
                chunks=tuple(self._chunks),
                total_tokens=self._total_tokens,
                total_bytes=self._total_bytes,
                completed=self._completed,
                failed=self._failed,
                error=self._error,
            )

    def text(self) -> str:
        with self._lock:
            return "".join(self._chunks)

    def iter_chunks(self) -> Iterator[str]:
        with self._lock:
            chunks = tuple(self._chunks)

        yield from chunks

    def clear(self) -> None:
        with self._lock:
            if self._completed or self._failed:
                raise RuntimeError(
                    "finished stream cannot be cleared"
                )

            self._buffer.clear()
            self._chunks.clear()
            self._total_tokens = 0
            self._total_bytes = 0


__all__ = [
    "TokenStream",
    "TokenStreamSnapshot",
]
