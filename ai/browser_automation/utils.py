"""
General AI platform utilities.
"""

from __future__ import annotations

import asyncio
import os
import time
from typing import Any, Awaitable, Callable, TypeVar


T = TypeVar("T")


def get_env(
    name: str,
    default: str | None = None,
) -> str | None:

    value = os.getenv(
        name
    )

    if value is None:
        return default

    return value


def get_env_int(
    name: str,
    default: int,
) -> int:

    value = get_env(
        name
    )

    if value is None:
        return default

    try:

        return int(value)

    except ValueError as exc:

        raise ValueError(
            f"Environment variable "
            f"{name} must be an integer."
        ) from exc


def get_env_float(
    name: str,
    default: float,
) -> float:

    value = get_env(
        name
    )

    if value is None:
        return default

    try:

        return float(value)

    except ValueError as exc:

        raise ValueError(
            f"Environment variable "
            f"{name} must be a number."
        ) from exc


def ensure_non_empty(
    value: str,
    field_name: str = "value",
) -> str:

    if not isinstance(
        value,
        str,
    ):

        raise TypeError(
            f"{field_name} must be a string."
        )

    value = value.strip()

    if not value:

        raise ValueError(
            f"{field_name} cannot be empty."
        )

    return value


def clamp(
    value: float,
    minimum: float,
    maximum: float,
) -> float:

    if minimum > maximum:

        raise ValueError(
            "minimum cannot be greater than maximum."
        )

    return max(
        minimum,
        min(
            value,
            maximum,
        ),
    )


def chunk_list(
    items: list[T],
    size: int,
) -> list[list[T]]:

    if size <= 0:

        raise ValueError(
            "size must be positive."
        )

    return [
        items[index:index + size]
        for index in range(
            0,
            len(items),
            size,
        )
    ]


async def with_timeout(
    operation: Callable[
        [], Awaitable[T]
    ],
    timeout: float | None = None,
) -> T:

    if timeout is None:

        return await operation()

    if timeout <= 0:

        raise ValueError(
            "timeout must be positive."
        )

    return await asyncio.wait_for(
        operation(),
        timeout=timeout,
    )


async def retry_async(
    operation: Callable[
        [], Awaitable[T]
    ],
    retries: int = 3,
    delay: float = 1.0,
) -> T:

    if retries < 0:

        raise ValueError(
            "retries cannot be negative."
        )

    last_error: Exception | None = None

    for attempt in range(
        retries + 1
    ):

        try:

            return await operation()

        except Exception as exc:

            last_error = exc

            if attempt >= retries:
                break

            await asyncio.sleep(
                delay * (attempt + 1)
            )

    raise last_error or RuntimeError(
        "Operation failed."
    )


def elapsed_seconds(
    started_at: float,
) -> float:

    return time.monotonic() - started_at


def mask_secret(
    value: str | None,
    visible_chars: int = 4,
) -> str:

    if not value:

        return ""

    if visible_chars < 0:

        raise ValueError(
            "visible_chars cannot be negative."
        )

    if len(value) <= visible_chars:

        return "*" * len(value)

    return (
        "*" * (
            len(value) - visible_chars
        )
        + value[-visible_chars:]
    )