from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .exceptions import AgentValidationError


def normalize_identifier(value: object, field_name: str = "identifier") -> str:
    """Validate and normalize an identifier for consistent lookup."""
    if not isinstance(value, str) or not value.strip():
        raise AgentValidationError(f"{field_name} must be a non-empty string")

    return value.strip()


def normalize_text(value: object, field_name: str = "text") -> str:
    """Validate text and normalize surrounding whitespace."""
    if not isinstance(value, str) or not value.strip():
        raise AgentValidationError(f"{field_name} must be a non-empty string")

    return value.strip()


def copy_metadata(value: object | None = None) -> dict[str, Any]:
    """Return a new metadata dictionary after validating its input."""
    if value is None:
        return {}

    if not isinstance(value, Mapping):
        raise AgentValidationError("metadata must be a mapping")

    return dict(value)


def require_keys(
    value: Mapping[str, Any],
    required_keys: tuple[str, ...],
    field_name: str = "value",
) -> None:
    """Raise a validation error when required keys are missing."""
    if not isinstance(value, Mapping):
        raise AgentValidationError(f"{field_name} must be a mapping")

    if not isinstance(required_keys, tuple) or any(
        not isinstance(key, str) or not key.strip()
        for key in required_keys
    ):
        raise ValueError("required_keys must be a tuple of non-empty strings")

    missing = [key for key in required_keys if key not in value]
    if missing:
        raise AgentValidationError(
            f"{field_name} is missing required keys: {', '.join(missing)}"
        )


__all__ = [
    "normalize_identifier",
    "normalize_text",
    "copy_metadata",
    "require_keys",
]
