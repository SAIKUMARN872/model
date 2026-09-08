"""
Utilities used by base ModelNow agents.
"""

from __future__ import annotations

import inspect
import json
import re
from typing import Any, Awaitable, Callable


def validate_agent_name(
    name: str,
) -> str:
    """
    Validate an agent name.
    """

    if not isinstance(name, str):
        raise TypeError(
            "Agent name must be a string"
        )

    name = name.strip()

    if not name:
        raise ValueError(
            "Agent name cannot be empty"
        )

    if len(name) > 100:
        raise ValueError(
            "Agent name cannot exceed 100 characters"
        )

    if not re.match(
        r"^[A-Za-z0-9_.-]+$",
        name,
    ):
        raise ValueError(
            "Agent name can only contain "
            "letters, numbers, '.', '_' and '-'"
        )

    return name


def validate_max_iterations(
    value: int,
) -> int:

    if not isinstance(value, int):
        raise TypeError(
            "max_iterations must be an integer"
        )

    if value <= 0:
        raise ValueError(
            "max_iterations must be greater than zero"
        )

    return value


def normalize_input(
    value: Any,
) -> str:

    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    return str(value).strip()


def normalize_output(
    value: Any,
) -> str:

    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    if isinstance(
        value,
        (dict, list, tuple),
    ):
        return json.dumps(
            value,
            default=str,
        )

    return str(value).strip()


def ensure_callable(
    value: Callable[..., Any],
    name: str = "function",
) -> None:

    if not callable(value):
        raise TypeError(
            f"{name} must be callable"
        )


async def execute(
    function: Callable[..., Any],
    *args: Any,
    **kwargs: Any,
) -> Any:
    """
    Execute either sync or async functions.
    """

    ensure_callable(function)

    result = function(
        *args,
        **kwargs,
    )

    if inspect.isawaitable(result):
        return await result

    return result


def safe_error(
    error: Exception,
) -> str:

    message = str(error).strip()

    if message:
        return message

    return error.__class__.__name__


def merge_metadata(
    *values: dict[str, Any] | None,
) -> dict[str, Any]:

    result: dict[str, Any] = {}

    for value in values:

        if value:
            result.update(value)

    return result


def truncate(
    value: str,
    maximum: int,
) -> str:

    if maximum <= 0:
        raise ValueError(
            "maximum must be greater than zero"
        )

    if len(value) <= maximum:
        return value

    if maximum <= 3:
        return value[:maximum]

    return (
        value[: maximum - 3]
        + "..."
    )


def is_async_callable(
    function: Callable[..., Any],
) -> bool:

    return inspect.iscoroutinefunction(
        function
    )


def run_sync(
    awaitable: Awaitable[Any],
) -> Any:
    """
    Run an async operation from synchronous code.

    Raises an error if an event loop is already running.
    """

    import asyncio

    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(
            awaitable
        )

    raise RuntimeError(
        "Cannot use run_sync() while an "
        "event loop is running. Use await instead."
    )