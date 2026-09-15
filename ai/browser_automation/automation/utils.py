"""
Utilities for browser automation workflows.
"""

from __future__ import annotations

import asyncio
import functools
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable


def utc_now() -> datetime:
    """Return the current UTC datetime."""
    return datetime.now(timezone.utc)


def generate_id(prefix: str = "task") -> str:
    """Generate a unique identifier."""
    return f"{prefix}_{uuid.uuid4().hex}"


def validate_name(name: str) -> str:
    """Validate a workflow/task name."""

    if not isinstance(name, str):
        raise TypeError("Name must be a string.")

    name = name.strip()

    if not name:
        raise ValueError("Name cannot be empty.")

    return name


def validate_timeout(
    timeout: float | None,
) -> float | None:
    """Validate timeout."""

    if timeout is None:
        return None

    timeout = float(timeout)

    if timeout <= 0:
        raise ValueError(
            "Timeout must be greater than zero."
        )

    return timeout


async def sleep(
    seconds: float,
) -> None:
    """Async sleep helper."""

    if seconds < 0:
        raise ValueError(
            "Sleep duration cannot be negative."
        )

    await asyncio.sleep(seconds)


async def retry_async(
    operation: Callable[
        [], Awaitable[Any]
    ],
    retries: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
) -> Any:
    """
    Retry an asynchronous operation.

    Example:
        result = await retry_async(
            lambda: page.goto(url)
        )
    """

    if retries < 0:
        raise ValueError(
            "retries cannot be negative."
        )

    if delay < 0:
        raise ValueError(
            "delay cannot be negative."
        )

    if backoff < 1:
        raise ValueError(
            "backoff must be >= 1."
        )

    last_error: Exception | None = None

    current_delay = delay

    for attempt in range(
        retries + 1
    ):
        try:
            return await operation()

        except Exception as exc:

            last_error = exc

            if attempt >= retries:
                break

            if current_delay:
                await asyncio.sleep(
                    current_delay
                )

            current_delay *= backoff

    raise last_error or RuntimeError(
        "Operation failed."
    )


def run_sync(
    coroutine: Awaitable[Any],
) -> Any:
    """
    Execute an async coroutine from synchronous code.

    Intended for environments where no event loop
    is already running.
    """

    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coroutine)

    raise RuntimeError(
        "run_sync cannot be used while an "
        "event loop is already running."
    )


def elapsed_seconds(
    started_at: float,
) -> float:
    """Return elapsed time."""

    return time.monotonic() - started_at


def timed(
    function: Callable[..., Any],
) -> Callable[..., Any]:
    """
    Decorator that adds execution timing.

    The measured value is available through
    the `_last_elapsed_seconds` attribute.
    """

    @functools.wraps(function)
    def wrapper(*args, **kwargs):

        started = time.monotonic()

        try:
            return function(
                *args,
                **kwargs,
            )

        finally:

            wrapper._last_elapsed_seconds = (
                time.monotonic() - started
            )

    return wrapper


def clean_text(
    value: Any,
) -> str:
    """Convert a value to clean text."""

    if value is None:
        return ""

    return str(value).strip()


def build_result(
    *,
    success: bool,
    data: Any = None,
    error: str | None = None,
    **metadata: Any,
) -> dict[str, Any]:
    """Build a standard automation result."""

    result = {
        "success": success,
        "data": data,
        "error": error,
        "timestamp": utc_now().isoformat(),
    }

    if metadata:
        result["metadata"] = metadata

    return result