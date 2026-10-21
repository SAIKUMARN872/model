"""Validation and normalization utilities for prompt formatting."""

from collections.abc import Mapping
import math
from typing import Any


SUPPORTED_FORMATS = ("text", "json", "markdown")


def validate_format(output_format: str) -> str:
    if not isinstance(output_format, str):
        raise ValueError("Output format must be a string.")

    normalized = output_format.strip().lower()
    if normalized not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported format {output_format!r}. "
            f"Supported formats: {', '.join(SUPPORTED_FORMATS)}."
        )
    return normalized


def normalize_data(value: Any, path: str = "$") -> Any:
    """Validate data recursively so serializers receive predictable values."""
    if value is None or isinstance(value, (str, bool, int)):
        return value

    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError(f"Non-finite number at {path}.")
        return value

    if isinstance(value, Mapping):
        result = {}
        for key, item in value.items():
            if not isinstance(key, str):
                raise TypeError(f"Mapping key at {path} must be a string.")
            result[key] = normalize_data(item, f"{path}.{key}")
        return result

    if isinstance(value, (list, tuple)):
        return [
            normalize_data(item, f"{path}[{index}]")
            for index, item in enumerate(value)
        ]

    raise TypeError(
        f"Unsupported value type at {path}: {type(value).__name__}."
    )


def require_text(value: Any, field_name: str = "text") -> str:
    if not isinstance(value, str):
        raise TypeError(f"{field_name} must be a string.")
    if not value.strip():
        raise ValueError(f"{field_name} must not be empty.")
    return value
