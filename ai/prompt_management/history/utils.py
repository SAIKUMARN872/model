"""Validation utilities for prompt history."""

from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def validate_identifier(value: str, field_name: str) -> str:
    if not isinstance(value, str):
        raise TypeError(f"{field_name} must be a string.")
    value = value.strip()
    if not value:
        raise ValueError(f"{field_name} must not be empty.")
    return value


def validate_metadata(metadata: dict[str, Any] | None) -> dict[str, Any]:
    if metadata is None:
        return {}
    if not isinstance(metadata, dict):
        raise TypeError("metadata must be a dictionary.")

    # Require JSON-compatible metadata so events can be persisted later.
    import json

    try:
        copied = json.loads(json.dumps(metadata, ensure_ascii=False, allow_nan=False))
    except (TypeError, ValueError) as exc:
        raise ValueError("metadata must contain valid JSON-compatible values.") from exc

    return copied


def validate_limit(limit: int | None) -> int | None:
    if limit is None:
        return None
    if isinstance(limit, bool) or not isinstance(limit, int):
        raise TypeError("limit must be an integer or None.")
    if limit < 1:
        raise ValueError("limit must be greater than zero.")
    return limit


def validate_datetime(value: datetime | None, field_name: str) -> datetime | None:
    if value is None:
        return None
    if not isinstance(value, datetime):
        raise TypeError(f"{field_name} must be a datetime or None.")
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must be timezone-aware.")
    return value.astimezone(timezone.utc)
