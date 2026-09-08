"""
Utility functions for the ModelNow execution package.
"""

from __future__ import annotations

import asyncio
import inspect
import time
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable


def utc_now() -> datetime:
    """Return the current UTC datetime."""

    return datetime.now(timezone.utc)


def ensure_callable(
    function: Callable[..., Any],
    name: str = "function",
) -> None:
    """Validate that an object is callable."""

    if not callable(function):
        raise TypeError(
            f"{name} must be callable"
        )


def is_async_callable(
    function: Callable[..., Any],
) -> bool:
    """Check whether a callable is asynchronous."""

    return inspect.iscoroutinefunction(
        function
    )


async def execute_callable(
    function: Callable[..., Any],
    *args: Any,
    **kwargs: Any,
) -> Any:
    """
    Execute either a synchronous or asynchronous callable.
    """

    ensure_callable(function)

    result = function(
        *args,
        **kwargs,
    )

    if inspect.isawaitable(result):
        return await result

    return result


def run_sync(
    awaitable: Awaitable[Any],
) -> Any:
    """
    Execute an awaitable from synchronous code.

    Raises:
        RuntimeError:
            If an event loop is already running.
    """

    try:
        asyncio.get_running_loop()

    except RuntimeError:

        return asyncio.run(
            awaitable
        )

    raise RuntimeError(
        "Cannot execute synchronously while "
        "an event loop is running. Use await instead."
    )


async def execute_with_timeout(
    function: Callable[..., Any],
    timeout: float | None,
    *args: Any,
    **kwargs: Any,
) -> Any:
    """
    Execute a callable with an optional timeout.
    """

    coroutine = execute_callable(
        function,
        *args,
        **kwargs,
    )

    if timeout is None:
        return await coroutine

    if timeout <= 0:
        raise ValueError(
            "timeout must be greater than zero"
        )

    return await asyncio.wait_for(
        coroutine,
        timeout=timeout,
    )


async def sleep(
    seconds: float,
) -> None:
    """Async sleep helper."""

    if seconds < 0:
        raise ValueError(
            "seconds cannot be negative"
        )

    await asyncio.sleep(
        seconds
    )


def elapsed_ms(
    start: float,
) -> float:
    """Return elapsed time in milliseconds."""

    return (
        time.perf_counter() - start
    ) * 1000.0


def serialize_result(
    value: Any,
) -> Any:
    """
    Convert common execution results into
    serialization-friendly values.
    """

    if value is None:
        return None

    if isinstance(
        value,
        (str, int, float, bool),
    ):
        return value

    if isinstance(value, dict):

        return {
            str(key): serialize_result(
                item
            )
            for key, item in value.items()
        }

    if isinstance(
        value,
        (list, tuple, set),
    ):

        return [
            serialize_result(item)
            for item in value
        ]

    if hasattr(value, "to_dict"):

        return value.to_dict()

    return str(value)


def safe_error(
    error: Exception,
) -> str:
    """Return a safe human-readable error message."""

    message = str(error).strip()

    if message:
        return message

    return error.__class__.__name__