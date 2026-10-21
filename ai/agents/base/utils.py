from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from ..exceptions import AgentValidationError


def validate_non_empty_string(value: object, field_name: str) -> str:
    """Validate and return a non-empty string."""
    if not isinstance(field_name, str) or not field_name.strip():
        raise ValueError("field_name must be a non-empty string")

    if not isinstance(value, str) or not value.strip():
        raise AgentValidationError(f"{field_name} must be a non-empty string")

    return value


def validate_mapping(
    value: object,
    field_name: str,
) -> dict[str, Any]:
    """Validate a mapping and return an independent dictionary."""
    if not isinstance(field_name, str) or not field_name.strip():
        raise ValueError("field_name must be a non-empty string")

    if not isinstance(value, Mapping):
        raise AgentValidationError(f"{field_name} must be a mapping")

    return dict(value)


def validate_positive_number(value: object, field_name: str) -> float:
    """Validate a positive finite numeric value."""
    import math

    if not isinstance(field_name, str) or not field_name.strip():
        raise ValueError("field_name must be a non-empty string")

    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise AgentValidationError(f"{field_name} must be a positive number")

    if not math.isfinite(value) or value <= 0:
        raise AgentValidationError(f"{field_name} must be a positive finite number")

    return float(value)


__all__ = [
    "validate_non_empty_string",
    "validate_mapping",
    "validate_positive_number",
]
