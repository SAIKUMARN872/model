from __future__ import annotations

from collections.abc import Sequence
from typing import Any


DEFAULT_MAX_BATCH_SIZE = 8
DEFAULT_MAX_WAIT_MS = 25.0
DEFAULT_MAX_TOKENS = 8192


def validate_batch_size(
    value: int,
) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise TypeError("batch size must be an integer")

    if value <= 0:
        raise ValueError("batch size must be greater than zero")

    return value


def validate_wait_ms(
    value: float,
) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise TypeError("wait time must be numeric")

    value = float(value)

    if value < 0:
        raise ValueError("wait time must not be negative")

    return value


def validate_token_limit(
    value: int,
) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise TypeError("token limit must be an integer")

    if value <= 0:
        raise ValueError("token limit must be greater than zero")

    return value


def estimate_tokens(
    value: Any,
) -> int:
    if value is None:
        return 0

    if isinstance(value, str):
        return max(1, (len(value) + 3) // 4) if value else 0

    if isinstance(value, dict):
        return sum(
            estimate_tokens(key) + estimate_tokens(item)
            for key, item in value.items()
        )

    if isinstance(value, Sequence) and not isinstance(
        value,
        (str, bytes, bytearray),
    ):
        return sum(
            estimate_tokens(item)
            for item in value
        )

    return estimate_tokens(str(value))


def batch_token_count(
    items: Sequence[Any],
) -> int:
    return sum(
        estimate_tokens(item)
        for item in items
    )


def can_add_to_batch(
    current_size: int,
    current_tokens: int,
    *,
    max_batch_size: int = DEFAULT_MAX_BATCH_SIZE,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    item_tokens: int = 0,
) -> bool:
    validate_batch_size(max_batch_size)
    validate_token_limit(max_tokens)

    if current_size < 0:
        raise ValueError(
            "current size must not be negative"
        )

    if current_tokens < 0:
        raise ValueError(
            "current tokens must not be negative"
        )

    if item_tokens < 0:
        raise ValueError(
            "item tokens must not be negative"
        )

    if current_size >= max_batch_size:
        return False

    return (
        current_tokens + item_tokens
        <= max_tokens
    )


def chunk_sequence(
    items: Sequence[Any],
    *,
    batch_size: int = DEFAULT_MAX_BATCH_SIZE,
) -> list[list[Any]]:
    validate_batch_size(batch_size)

    return [
        list(items[index:index + batch_size])
        for index in range(
            0,
            len(items),
            batch_size,
        )
    ]
