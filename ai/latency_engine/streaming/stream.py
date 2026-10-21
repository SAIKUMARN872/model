from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from threading import RLock
from time import monotonic
from typing import Any, Iterable, Iterator, Mapping
from uuid import uuid4

from .token_stream import (
    TokenStream,
    TokenStreamSnapshot,
)
from .utils import (
    calculate_duration_ms,
    calculate_tokens_per_second,
)


class StreamStatus(str, Enum):
    CREATED = "created"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass(frozen=True)
class StreamSnapshot:
    stream_id: str
    status: StreamStatus
    token_stream: TokenStreamSnapshot
    started_at: float | None
    ended_at: float | None
    duration_ms: float
    metadata: Mapping[str, Any] = field(
        default_factory=dict
    )

    @property
    def text(self) -> str:
        return self.token_stream.text

    @property
    def total_tokens(self) -> int:
        return self.token_stream.total_tokens

    @property
    def total_bytes(self) -> int:
        return self.token_stream.total_bytes


class ResponseStream:
    def __init__(
        self,
        *,
        stream_id: str | None = None,
        max_buffer_size: int = 64 * 1024,
        metadata: Mapping[str, Any] | None = None,
    ) -> None:
        self._stream_id = (
            stream_id or f"stream-{uuid4().hex}"
        )

        if not self._stream_id:
            raise ValueError(
                "stream_id must not be empty"
            )

        self._token_stream = TokenStream(
            max_buffer_size=max_buffer_size
        )

        self._status = StreamStatus.CREATED
        self._started_at: float | None = None
        self._ended_at: float | None = None
        self._metadata = dict(metadata or {})
        self._lock = RLock()

    @property
    def stream_id(self) -> str:
        return self._stream_id

    @property
    def status(self) -> StreamStatus:
        with self._lock:
            return self._status

    @property
    def active(self) -> bool:
        return self.status == StreamStatus.ACTIVE

    @property
    def completed(self) -> bool:
        return self.status == StreamStatus.COMPLETED

    @property
    def failed(self) -> bool:
        return self.status == StreamStatus.FAILED

    @property
    def started_at(self) -> float | None:
        with self._lock:
            return self._started_at

    @property
    def ended_at(self) -> float | None:
        with self._lock:
            return self._ended_at

    def start(self) -> None:
        with self._lock:
            if self._status != StreamStatus.CREATED:
                raise RuntimeError(
                    "stream can only be started once"
                )

            self._started_at = monotonic()
            self._status = StreamStatus.ACTIVE

    def push(self, chunk: Any) -> str:
        with self._lock:
            if self._status == StreamStatus.CREATED:
                self._started_at = monotonic()
                self._status = StreamStatus.ACTIVE

            if self._status != StreamStatus.ACTIVE:
                raise RuntimeError(
                    "stream is not active"
                )

            return self._token_stream.push(chunk)

    def push_many(
        self,
        chunks: Iterable[Any],
    ) -> int:
        count = 0

        for chunk in chunks:
            self.push(chunk)
            count += 1

        return count

    def complete(self) -> StreamSnapshot:
        with self._lock:
            if self._status != StreamStatus.ACTIVE:
                raise RuntimeError(
                    "only an active stream can complete"
                )

            self._token_stream.complete()
            self._ended_at = monotonic()
            self._status = StreamStatus.COMPLETED

            return self.snapshot()

    def fail(
        self,
        error: str | Exception,
    ) -> StreamSnapshot:
        with self._lock:
            if self._status == StreamStatus.CREATED:
                self._started_at = monotonic()

            if self._status != StreamStatus.ACTIVE:
                raise RuntimeError(
                    "only an active stream can fail"
                )

            self._token_stream.fail(error)
            self._ended_at = monotonic()
            self._status = StreamStatus.FAILED

            return self.snapshot()

    def snapshot(self) -> StreamSnapshot:
        with self._lock:
            duration_ms = 0.0

            if (
                self._started_at is not None
                and self._ended_at is not None
            ):
                duration_ms = calculate_duration_ms(
                    self._started_at,
                    self._ended_at,
                )
            elif self._started_at is not None:
                duration_ms = calculate_duration_ms(
                    self._started_at,
                    monotonic(),
                )

            return StreamSnapshot(
                stream_id=self._stream_id,
                status=self._status,
                token_stream=(
                    self._token_stream.snapshot()
                ),
                started_at=self._started_at,
                ended_at=self._ended_at,
                duration_ms=duration_ms,
                metadata=dict(self._metadata),
            )

    def text(self) -> str:
        return self._token_stream.text()

    def iter_chunks(self) -> Iterator[str]:
        return self._token_stream.iter_chunks()

    def tokens_per_second(self) -> float:
        snapshot = self.snapshot()

        return calculate_tokens_per_second(
            snapshot.total_tokens,
            snapshot.duration_ms,
        )


__all__ = [
    "ResponseStream",
    "StreamSnapshot",
    "StreamStatus",
]
