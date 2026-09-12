"""
Utility functions for the embeddings batching subsystem.
"""

from __future__ import annotations

import inspect
import time
from typing import Any, Awaitable, Callable


def current_time() -> float:
    """Return a monotonic timestamp."""

    return time.monotonic()


def elapsed_ms(
    started_at: float,
) -> float:
    """Return elapsed time in milliseconds."""

    return (
        time.monotonic() - started_at
    ) * 1000.0


def is_async_callable(
    function: Callable[..., Any],
) -> bool:
    """Check whether a callable is asynchronous."""

    return inspect.iscoroutinefunction(
        function
    )


async def maybe_await(
    value: Any,
) -> Any:
    """
    Await a value if it is awaitable.

    This allows the batching system to work with both
    synchronous and asynchronous embedding providers.
    """

    if inspect.isawaitable(value):
        return await value

    return value


def estimate_tokens(
    text: str,
) -> int:
    """
    Estimate token count.

    This is intentionally lightweight. A real tokenizer can
    be injected later when exact token accounting is required.
    """

    if not text:
        return 0

    return max(
        1,
        (len(text) + 3) // 4,
    )


def estimate_item_tokens(
    item: Any,
) -> int:
    """Estimate tokens for a generic embedding input."""

    if isinstance(
        item,
        str,
    ):
        return estimate_tokens(item)

    if isinstance(
        item,
        (list, tuple),
    ):

        return sum(
            estimate_item_tokens(value)
            for value in item
        )

    if isinstance(
        item,
        dict,
    ):

        return sum(
            estimate_item_tokens(key)
            + estimate_item_tokens(value)
            for key, value in item.items()
        )

    return estimate_tokens(
        str(item)
    )


def normalize_batch_size(
    batch_size: int,
) -> int:

    if not isinstance(
        batch_size,
        int,
    ):

        raise TypeError(
            "batch_size must be an integer"
        )

    if batch_size <= 0:

        raise ValueError(
            "batch_size must be greater than zero"
        )

    return batch_size


def normalize_timeout(
    timeout: float | None,
) -> float | None:

    if timeout is None:
        return None

    if timeout <= 0:

        raise ValueError(
            "timeout must be greater than zero"
        )

    return float(timeout)


def validate_embedding(
    embedding: Any,
) -> list[float]:
    """
    Validate and normalize one embedding vector.
    """

    if not isinstance(
        embedding,
        (list, tuple),
    ):

        raise TypeError(
            "Embedding must be a list or tuple"
        )

    result = []

    for value in embedding:

        if not isinstance(
            value,
            (int, float),
        ):

            raise TypeError(
                "Embedding values must be numeric"
            )

        result.append(
            float(value)
        )

    if not result:

        raise ValueError(
            "Embedding cannot be empty"
        )

    return result


def validate_embeddings(
    embeddings: Any,
    expected_count: int,
) -> list[list[float]]:
    """Validate a batch of embeddings."""

    if not isinstance(
        embeddings,
        (list, tuple),
    ):

        raise TypeError(
            "Embedding provider must return a list"
        )

    if len(embeddings) != expected_count:

        raise ValueError(
            "Embedding provider returned "
            f"{len(embeddings)} embeddings for "
            f"{expected_count} inputs"
        )

    return [
        validate_embedding(
            embedding
        )
        for embedding in embeddings
    ]


def chunked(
    values: list[Any],
    size: int,
) -> list[list[Any]]:
    """Split a list into fixed-size chunks."""

    normalize_batch_size(
        size
    )

    return [
        values[index:index + size]
        for index in range(
            0,
            len(values),
            size,
        )
    ]


def safe_exception_message(
    error: Exception,
) -> str:

    message = str(error).strip()

    if message:
        return message

    return error.__class__.__name__