from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from typing import Any


_PLACEHOLDER_PATTERN = re.compile(r"\{([A-Za-z_][A-Za-z0-9_]*)\}")


def validate_variable_name(name: str) -> str:
    if not isinstance(name, str):
        raise TypeError("variable name must be a string")
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name):
        raise ValueError(f"Invalid variable name: {name!r}")
    return name


def find_placeholders(text: str) -> tuple[str, ...]:
    if not isinstance(text, str):
        raise TypeError("text must be a string")
    names = tuple(dict.fromkeys(_PLACEHOLDER_PATTERN.findall(text)))
    remainder = _PLACEHOLDER_PATTERN.sub("", text)
    if "{" in remainder or "}" in remainder:
        raise ValueError("Malformed placeholder; use simple {variable_name} syntax")
    return names


def validate_context(context: Mapping[str, Any]) -> dict[str, Any]:
    if not isinstance(context, Mapping):
        raise TypeError("context must be a mapping")
    result = dict(context)
    for name in result:
        validate_variable_name(name)
    return result


def validate_variable_type(value: Any, expected_type: type | tuple[type, ...]) -> bool:
    if not isinstance(expected_type, (type, tuple)):
        raise TypeError("expected_type must be a type or tuple of types")
    # bool is a subclass of int; keep bool distinct for integer declarations.
    if expected_type is int and isinstance(value, bool):
        return False
    return isinstance(value, expected_type)
