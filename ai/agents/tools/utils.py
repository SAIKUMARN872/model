"""
Utility functions for the AI tools package.
"""

from __future__ import annotations

import inspect
import json
import re
import time
from typing import Any, Awaitable, Callable
from uuid import uuid4


def generate_tool_id(
    name: str | None = None,
) -> str:
    """Generate a unique tool ID."""

    prefix = normalize_tool_name(
        name or "tool"
    )

    return f"{prefix}_{uuid4().hex[:12]}"


def normalize_tool_name(
    name: str,
) -> str:
    """Normalize a tool name into a safe identifier."""

    if not isinstance(name, str):
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

    if not isinstance(name, str):
        return False

    return bool(
        re.fullmatch(
            r"[a-zA-Z0-9_-]+",
            name,
        )
    )


def is_async_callable(
    function: Callable[..., Any],
) -> bool:
    """Return True when a callable is asynchronous."""

    return inspect.iscoroutinefunction(
        function
    )


async def execute_callable(
    function: Callable[..., Any],
    *args: Any,
    **kwargs: Any,
) -> Any:
    """
    Execute either a synchronous or asynchronous function.
    """

    if not callable(function):
        raise TypeError(
            "Tool must be callable"
        )

    result = function(
        *args,
        **kwargs,
    )

    if inspect.isawaitable(result):
        return await result

    return result


def serialize_value(
    value: Any,
) -> Any:
    """
    Convert common Python values into serializable values.
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

    try:

        json.dumps(value)

        return value

    except (
        TypeError,
        ValueError,
    ):

        return str(value)


def safe_exception_message(
    error: Exception,
) -> str:
    """Return a safe exception message."""

    message = str(error).strip()

    if message:
        return message

    return error.__class__.__name__


def current_time() -> float:
    """Return high-resolution timer value."""

    return time.perf_counter()


def elapsed_ms(
    start_time: float,
) -> float:
    """Return elapsed time in milliseconds."""

    return (
        time.perf_counter()
        - start_time
    ) * 1000.0


def get_function_description(
    function: Callable[..., Any],
) -> str:
    """Get a function's documentation string."""

    description = inspect.getdoc(
        function
    )

    if description:
        return description.strip()

    return (
        f"Execute "
        f"{getattr(function, '__name__', 'tool')}"
    )


def get_function_parameters(
    function: Callable[..., Any],
) -> dict[str, Any]:
    """
    Extract basic parameter information from a function.
    """

    signature = inspect.signature(
        function
    )

    parameters = {}

    for name, parameter in (
        signature.parameters.items()
    ):

        if name in {"self", "cls"}:
            continue

        annotation = parameter.annotation

        if annotation is inspect.Parameter.empty:
            parameter_type = "string"
        else:
            parameter_type = python_type_to_json(
                annotation
            )

        item = {
            "type": parameter_type,
        }

        if (
            parameter.default
            is not inspect.Parameter.empty
        ):

            item["default"] = serialize_value(
                parameter.default
            )

        parameters[name] = item

    return parameters


def python_type_to_json(
    annotation: Any,
) -> str:
    """Map Python types to JSON schema types."""

    mapping = {
        str: "string",
        int: "integer",
        float: "number",
        bool: "boolean",
        list: "array",
        tuple: "array",
        set: "array",
        dict: "object",
    }

    return mapping.get(
        annotation,
        "string",
    )


def validate_arguments(
    function: Callable[..., Any],
    arguments: dict[str, Any],
) -> None:
    """Validate arguments against a function signature."""

    if not isinstance(
        arguments,
        dict,
    ):
        raise TypeError(
            "Tool arguments must be a dictionary"
        )

    signature = inspect.signature(
        function
    )

    try:

        signature.bind(
            **arguments
        )

    except TypeError as exc:

        raise ValueError(
            f"Invalid tool arguments: {exc}"
        ) from exc