"""
Embedding batcher.

Collects individual embedding requests and combines them
into provider-sized batches.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable

from .queue import (
    EmbeddingRequest,
)
from .utils import (
    elapsed_ms,
    safe_exception_message,
    validate_embeddings,
)


EmbeddingFunction = Callable[
    [list[Any]],
    Any,
]


class BatchingError(Exception):
    """Base batcher exception."""


class BatchExecutionError(
    BatchingError
):
    """Raised when an embedding batch fails."""


@dataclass
class EmbeddingBatch:
    """
    A collection of embedding requests.
    """

    requests: list[EmbeddingRequest]

    batch_id: str

    token_count: int = 0

    created_at: float = field(
        default_factory=lambda: __import__(
            "time"
        ).monotonic()
    )

    @property
    def size(self) -> int:

        return len(
            self.requests
        )

    def inputs(self) -> list[Any]:

        return [
            request.text
            for request
            in self.requests
        ]


@dataclass
class BatchResult:
    """
    Result of processing one embedding batch.
    """

    batch_id: str

    success: bool

    embeddings: list[list[float]] = field(
        default_factory=list
    )

    error: str | None = None

    duration_ms: float = 0.0

    request_count: int = 0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class BatcherConfig:
    """
    Configuration for the embedding batcher.
    """

    max_batch_size: int = 32

    max_batch_tokens: int | None = None

    timeout: float | None = 30.0

    max_retries: int = 2

    retry_delay: float = 0.5

    def __post_init__(self) -> None:

        if self.max_batch_size <= 0:

            raise ValueError(
                "max_batch_size must be positive"
            )

        if (
            self.max_batch_tokens is not None
            and self.max_batch_tokens <= 0
        ):

            raise ValueError(
                "max_batch_tokens must be positive"
            )

        if (
            self.timeout is not None
            and self.timeout <= 0
        ):

            raise ValueError(
                "timeout must be positive"
            )

        if self.max_retries < 0:

            raise ValueError(
                "max_retries cannot be negative"
            )

        if self.retry_delay < 0:

            raise ValueError(
                "retry_delay cannot be negative"
            )


class EmbeddingBatcher:
    """
    Groups requests and sends them to an embedding provider.

    The provider receives:

        list[input]

    and must return:

        list[embedding]
    """

    def __init__(
        self,
        embedding_function: EmbeddingFunction,
        config: BatcherConfig | None = None,
    ) -> None:

        if not callable(
            embedding_function
        ):

            raise TypeError(
                "embedding_function must be callable"
            )

        self.embedding_function = (
            embedding_function
        )

        self.config = (
            config
            or BatcherConfig()
        )

        self._batch_counter = 0

    def create_batch(
        self,
        requests: list[EmbeddingRequest],
    ) -> EmbeddingBatch:

        if not requests:

            raise ValueError(
                "Cannot create an empty batch"
            )

        self._batch_counter += 1

        return EmbeddingBatch(
            requests=requests,
            batch_id=(
                f"batch-{self._batch_counter}"
            ),
            token_count=sum(
                request.token_count
                for request in requests
            ),
        )

    def split_requests(
        self,
        requests: list[EmbeddingRequest],
    ) -> list[EmbeddingBatch]:

        batches: list[
            EmbeddingBatch
        ] = []

        current: list[
            EmbeddingRequest
        ] = []

        current_tokens = 0

        for request in requests:

            request_tokens = (
                request.token_count
            )

            exceeds_size = (
                len(current)
                >= self.config.max_batch_size
            )

            exceeds_tokens = (
                self.config.max_batch_tokens
                is not None
                and current
                and (
                    current_tokens
                    + request_tokens
                    > self.config.max_batch_tokens
                )
            )

            if (
                exceeds_size
                or exceeds_tokens
            ):

                batches.append(
                    self.create_batch(
                        current
                    )
                )

                current = []

                current_tokens = 0

            current.append(
                request
            )

            current_tokens += (
                request_tokens
            )

        if current:

            batches.append(
                self.create_batch(
                    current
                )
            )

        return batches

    async def execute(
        self,
        batch: EmbeddingBatch,
    ) -> BatchResult:

        started_at = (
            __import__(
                "time"
            ).monotonic()
        )

        last_error: str | None = None

        attempts = (
            self.config.max_retries + 1
        )

        for attempt in range(
            1,
            attempts + 1,
        ):

            try:

                value = self.embedding_function(
                    batch.inputs()
                )

                if asyncio.iscoroutine(
                    value
                ):

                    if (
                        self.config.timeout
                        is not None
                    ):

                        value = await asyncio.wait_for(
                            value,
                            timeout=self.config.timeout,
                        )

                    else:

                        value = await value

                elif hasattr(
                    value,
                    "__await__",
                ):

                    if (
                        self.config.timeout
                        is not None
                    ):

                        value = await asyncio.wait_for(
                            value,
                            timeout=self.config.timeout,
                        )

                    else:

                        value = await value

                embeddings = validate_embeddings(
                    value,
                    batch.size,
                )

                result = BatchResult(
                    batch_id=batch.batch_id,
                    success=True,
                    embeddings=embeddings,
                    duration_ms=elapsed_ms(
                        started_at
                    ),
                    request_count=batch.size,
                    metadata={
                        "attempts": attempt,
                        "token_count": batch.token_count,
                    },
                )

                self._resolve_requests(
                    batch,
                    embeddings,
                )

                return result

            except asyncio.TimeoutError:

                last_error = (
                    "Embedding batch timed out"
                )

            except Exception as exc:

                last_error = safe_exception_message(
                    exc
                )

            if attempt < attempts:

                if self.config.retry_delay > 0:

                    await asyncio.sleep(
                        self.config.retry_delay
                    )

        error = (
            last_error
            or "Embedding batch failed"
        )

        self._reject_requests(
            batch,
            BatchExecutionError(
                error
            ),
        )

        return BatchResult(
            batch_id=batch.batch_id,
            success=False,
            error=error,
            duration_ms=elapsed_ms(
                started_at
            ),
            request_count=batch.size,
            metadata={
                "attempts": attempts,
                "token_count": batch.token_count,
            },
        )

    @staticmethod
    def _resolve_requests(
        batch: EmbeddingBatch,
        embeddings: list[list[float]],
    ) -> None:

        for request, embedding in zip(
            batch.requests,
            embeddings,
        ):

            request.set_result(
                embedding
            )

    @staticmethod
    def _reject_requests(
        batch: EmbeddingBatch,
        error: Exception,
    ) -> None:

        for request in batch.requests:

            request.set_exception(
                error
            )