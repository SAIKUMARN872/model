"""Utilities for validating and normalizing MCP data."""

import json
from collections.abc import Mapping
from typing import Any


def normalize_object(value: Any, *, field_name: str = "value") -> dict:
    """Normalize a mapping to a plain dictionary."""
    if not isinstance(value, Mapping):
        raise ValueError(f"{field_name} must be an object.")
    return dict(value)


def ensure_json_serializable(value: Any) -> Any:
    """Return a value after confirming it can be represented as JSON."""
    try:
        json.dumps(value, allow_nan=False)
    except (TypeError, ValueError) as exc:
        raise ValueError("Value must be JSON serializable.") from exc
    return value


def normalize_optional_object(value: Any = None) -> dict:
    """Normalize omitted optional object parameters to an empty dictionary."""
    if value is None:
        return {}
    return normalize_object(value)


def check_max_size(payload: bytes | str, max_bytes: int) -> int:
    """Return encoded payload size, rejecting invalid limits or oversize data."""
    if not isinstance(max_bytes, int) or isinstance(max_bytes, bool) or max_bytes < 1:
        raise ValueError("max_bytes must be a positive integer.")
    if isinstance(payload, str):
        size = len(payload.encode("utf-8"))
    elif isinstance(payload, bytes):
        size = len(payload)
    else:
        raise TypeError("payload must be bytes or text.")
    if size > max_bytes:
        raise ValueError("Payload exceeds maximum allowed size.")
    return size
