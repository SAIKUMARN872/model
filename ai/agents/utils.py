"""
Utility helpers for the ModelNow tool system.
"""

from __future__ import annotations

import inspect
import re
import time
from typing import Any, Callable
from uuid import uuid4


def normalize_tool_name(
    name: str,
) -> str:
    """Normalize a tool name."""

    if not isinstance(
        name,
        str,
    ):
        raise TypeError(
            "Tool name must be a string"
        )

    name = name.strip().lower()

    name = re.sub(
        r"[^a-zA-Z0-9_-]+",
        "_",
        name,
    )

    name = re.sub(
        r"_+",
        "_",
        name,
    )

    name = name.strip("_")

    if not name:

        raise ValueError(
            "Tool name cannot be empty"
        )

    return name


def validate_tool_name(
    name: str,
) -> bool:
    """Check whether a tool name is valid."""

    if not isinstance(
        name,
        str,
    ):
        return False

    return bool(
        re.fullmatch(
            r"[a-zA-Z0-9_-]+",
            name,
        )
    )


def generate_tool_id(
    name: str = "tool",
) -> str:

    return (
        f"{normalize_tool_name(name)}"
        f"_{uuid4().hex[:12]}"
    )


def is_async_callable(
    function: Callable[..., Any],
) -> bool:

    return inspect.iscoroutinefunction(
        function
    )


def get_description(
    function: Callable[..., Any],
) -> str:

    description = inspect.getdoc(
        function
    )

    if description:
        return description.strip()

    return (
        f"Execute "
        f"{getattr(function, '__name__', 'tool')}"
    )


def timer_start() -> float:

    return time.perf_counter()


def elapsed_ms(
    start: float,
) -> float:

    return (
        time.perf_counter()
        - start
    ) * 1000.0


def serialize_value(
    value: Any,
) -> Any:
    """Convert common Python objects to serializable values."""

    if value is None:
        return None

    if isinstance(
        value,
        (str, int, float, bool),
    ):
        return value

    if isinstance(
        value,
        dict,
    ):

        return {
            str(key): serialize_value(
                item
            )
            for key, item in value.items()
        }

    if isinstance(
        value,
        (list, tuple, set),
    ):

        return [
            serialize_value(item)
            for item in value
        ]

    if hasattr(
        value,
        "to_dict",
    ):

        return serialize_value(
            value.to_dict()
        )

    return str(value)


def safe_error(
    error: Exception,
) -> str:

    message = str(error).strip()

    if message:
        return message

    return error.__class__.__name__


def matches_category(
    tool: Any,
    category: str | None,
) -> bool:

    if category is None:
        return True

    return getattr(
        tool,
        "category",
        None,
    ) == category