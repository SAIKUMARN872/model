"""Reusable low-level validation rules."""

from collections.abc import Mapping
from typing import Any


def require_non_empty_string(value: Any, field_name: str = "value") -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string.")
    return value.strip()


def require_mapping(value: Any, field_name: str = "value") -> Mapping:
    if not isinstance(value, Mapping):
        raise ValueError(f"{field_name} must be an object.")
    return value


def require_string_list(value: Any, field_name: str = "value") -> list[str]:
    if not isinstance(value, list) or not all(
        isinstance(item, str) and item.strip() for item in value
    ):
        raise ValueError(f"{field_name} must be a list of non-empty strings.")
    return [item.strip() for item in value]


def require_boolean(value: Any, field_name: str = "value") -> bool:
    if not isinstance(value, bool):
        raise ValueError(f"{field_name} must be a boolean.")
    return value
