"""Validation utilities for the agent tools subsystem."""

from __future__ import annotations

import re
from typing import Any


def validate_tool_name(name: str) -> str:
    if not isinstance(name, str):
        raise ValueError("Tool name must be a string.")

    name = name.strip()
    if not name or len(name) > 100:
        raise ValueError("Tool name must contain 1-100 characters.")

    if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_.-]*", name):
        raise ValueError(
            "Tool name must start with a letter and contain only "
            "letters, digits, underscores, dots, or hyphens."
        )

    return name


def validate_description(description: str) -> str:
    if not isinstance(description, str) or not description.strip():
        raise ValueError("Tool description must be a non-empty string.")
    return description.strip()


def validate_arguments(arguments: Any) -> dict[str, Any]:
    if arguments is None:
        return {}
    if not isinstance(arguments, dict):
        raise ValueError("Tool arguments must be a dictionary.")
    return dict(arguments)
