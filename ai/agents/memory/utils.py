"""Validation and utility helpers for agent memory."""

from __future__ import annotations

import copy
import re
from typing import Any, Mapping


def validate_text(value: str, field_name: str = "value") -> str:
    """Return stripped, non-empty text or raise ValueError."""
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string.")
    value = value.strip()
    if not value:
        raise ValueError(f"{field_name} cannot be empty.")
    return value


def normalize_memory_key(key: str) -> str:
    """Normalize a memory key while preserving readable separators."""
    key = validate_text(key, "key").lower()
    key = re.sub(r"\s+", "_", key)
    if len(key) > 200:
        raise ValueError("key cannot exceed 200 characters.")
    if not re.fullmatch(r"[a-z0-9][a-z0-9_.:-]*", key):
        raise ValueError("key contains unsupported characters.")
    return key


def copy_metadata(
    metadata: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Return an independent copy of dictionary-like metadata."""
    if metadata is None:
        return {}
    if not isinstance(metadata, Mapping):
        raise ValueError("metadata must be a mapping.")
    return copy.deepcopy(dict(metadata))
