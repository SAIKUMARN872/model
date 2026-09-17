"""
Utilities for automation execution.
"""

from __future__ import annotations

import asyncio
import time
from typing import Any, Awaitable, Callable


async def execute_with_timeout(
    operation: Callable[
        [], Awaitable[Any]
    ],
    timeout: float | None = None,
) -> Any:

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


async def retry(
    operation: Callable[
        [], Awaitable[Any]
    ],
    retries: int = 3,
    delay: float = 1.0,
) -> Any:

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
        "Execution failed."
    )


def execution_duration(
    started: float,
) -> float:

    return time.monotonic() - started


def build_execution_result(
    *,
    success: bool,
    result: Any = None,
    error: str | None = None,
    duration: float = 0.0,
    task_id: str | None = None,
) -> dict[str, Any]:

    return {
        "success": success,
        "result": result,
        "error": error,
        "duration": duration,
        "task_id": task_id,
    }