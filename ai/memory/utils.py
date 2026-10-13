"""Shared validation, timestamp, and serialization utilities."""

from __future__ import annotations

import hashlib
import json
import math
import re
import unicodedata
from datetime import datetime, timezone
from typing import Any

from .exceptions import MemorySerializationError, MemoryValidationError


def utc_now() -> datetime:
    """Return the current timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


def ensure_utc(value: datetime | str | None, *, field: str = "timestamp") -> datetime | None:
    """Parse a timestamp and normalize it to timezone-aware UTC."""
    if value is None:
        return None

    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError as exc:
            raise MemoryValidationError(f"{field} must be a valid ISO-8601 timestamp") from exc

    if not isinstance(value, datetime):
        raise MemoryValidationError(f"{field} must be a datetime or ISO-8601 string")

    if value.tzinfo is None or value.utcoffset() is None:
        raise MemoryValidationError(f"{field} must include a timezone")

    return value.astimezone(timezone.utc)


def normalize_text(value: str, *, field: str = "text", max_chars: int = 1_000_000) -> str:
    """Normalize Unicode and whitespace without silently truncating content."""
    if not isinstance(value, str):
        raise MemoryValidationError(f"{field} must be a string")

    value = unicodedata.normalize("NFC", value)
    value = value.strip()

    if not value:
        raise MemoryValidationError(f"{field} must not be empty")
    if len(value) > max_chars:
        raise MemoryValidationError(f"{field} exceeds the {max_chars}-character limit")

    return value


def validate_identifier(value: str, *, field: str = "identifier", max_chars: int = 256) -> str:
    """Validate a non-empty identifier without changing its identity."""
    if not isinstance(value, str):
        raise MemoryValidationError(f"{field} must be a string")
    if not value or value != value.strip():
        raise MemoryValidationError(f"{field} must be non-empty and have no outer whitespace")
    if len(value) > max_chars:
        raise MemoryValidationError(f"{field} exceeds {max_chars} characters")
    if any(ord(char) < 32 or ord(char) == 127 for char in value):
        raise MemoryValidationError(f"{field} must not contain control characters")
    return value


def validate_json_object(
    value: dict[str, Any] | None,
    *,
    field: str = "metadata",
    max_bytes: int = 65_536,
) -> dict[str, Any]:
    """Copy and validate a JSON-compatible object with a size bound."""
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise MemoryValidationError(f"{field} must be a dictionary")

    if any(not isinstance(key, str) for key in value):
        raise MemoryValidationError(f"{field} keys must be strings")

    try:
        encoded = json.dumps(
            value,
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, RecursionError) as exc:
        raise MemorySerializationError(f"{field} must contain finite JSON-compatible values") from exc

    if len(encoded) > max_bytes:
        raise MemoryValidationError(f"{field} exceeds the {max_bytes}-byte limit")

    return json.loads(encoded)


def validate_finite_number(value: Any, *, field: str = "value") -> float:
    """Convert a numeric input to a finite float."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise MemoryValidationError(f"{field} must be a number")
    result = float(value)
    if not math.isfinite(result):
        raise MemoryValidationError(f"{field} must be finite")
    return result


def stable_hash(value: str) -> str:
    """Return a deterministic SHA-256 digest for deduplication keys."""
    if not isinstance(value, str):
        raise MemoryValidationError("value must be a string")
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def safe_slug(value: str, *, max_chars: int = 80) -> str:
    """Create a readable, bounded slug; do not use it as an authorization key."""
    if not isinstance(value, str):
        raise MemoryValidationError("value must be a string")
    slug = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip()).strip("-_").lower()
    if not slug:
        raise MemoryValidationError("value cannot produce a non-empty slug")
    return slug[:max_chars]
