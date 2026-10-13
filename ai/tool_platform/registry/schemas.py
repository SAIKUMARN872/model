"""Validation helpers for tool platform metadata."""

from __future__ import annotations

import re
from typing import Any

_NAME_PATTERN = re.compile(r"^[A-Za-z][A-Za-z0-9_.-]{0,127}$")
_VERSION_PATTERN = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")


def validate_tool_name(name: str) -> str:
    if not isinstance(name, str) or not _NAME_PATTERN.fullmatch(name):
        raise ValueError("Tool name must start with a letter and contain only letters, digits, '.', '_' or '-'.")
    return name


def validate_version(version: str) -> str:
    if not isinstance(version, str) or not _VERSION_PATTERN.fullmatch(version):
        raise ValueError("Tool version must use semantic version format, for example 1.0.0.")
    return version


def validate_input_schema(schema: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(schema, dict):
        raise TypeError("Input schema must be a dictionary.")
    if schema and schema.get("type") not in (None, "object"):
        raise ValueError("Tool input schema must describe an object.")
    properties = schema.get("properties", {})
    required = schema.get("required", [])
    if not isinstance(properties, dict):
        raise ValueError("Schema properties must be a dictionary.")
    if not isinstance(required, list) or any(
        not isinstance(name, str) or not name for name in required
    ):
        raise ValueError("Schema required must be a list of non-empty strings.")
    unknown = set(required) - set(properties)
    if unknown:
        raise ValueError(f"Required fields are missing from properties: {sorted(unknown)}")
    return schema
