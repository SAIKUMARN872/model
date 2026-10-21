from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Mapping


MAX_IDENTIFIER_LENGTH = 200
MAX_CONTENT_LENGTH = 100000
MAX_METADATA_BYTES = 65536
MAX_BUFFER_ITEMS = 10000
MAX_ITEM_BYTES = 262144


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def validate_identifier(value: str, field: str = "identifier") -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field} must be a string")
    value = value.strip()
    if not value or len(value) > MAX_IDENTIFIER_LENGTH:
        raise ValueError(
            f"{field} must contain 1-{MAX_IDENTIFIER_LENGTH} characters"
        )
    if any(ord(char) < 32 or ord(char) == 127 for char in value):
        raise ValueError(f"{field} contains control characters")
    return value


def validate_content(value: str) -> str:
    if not isinstance(value, str):
        raise ValueError("content must be a string")
    if not value.strip():
        raise ValueError("content cannot be empty")
    if len(value) > MAX_CONTENT_LENGTH:
        raise ValueError("content exceeds maximum length")
    return value


def validate_metadata(value: Mapping[str, Any] | None) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, Mapping):
        raise ValueError("metadata must be a mapping")

    try:
        encoded = json.dumps(
            dict(value),
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError("metadata must be JSON-compatible and finite") from exc

    if len(encoded) > MAX_METADATA_BYTES:
        raise ValueError("metadata exceeds maximum size")

    return json.loads(encoded.decode("utf-8"))


def validate_json_value(value: Any, max_bytes: int = MAX_ITEM_BYTES) -> Any:
    try:
        encoded = json.dumps(
            value,
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError("value must be JSON-compatible and finite") from exc

    if len(encoded) > max_bytes:
        raise ValueError("value exceeds maximum serialized size")

    return json.loads(encoded.decode("utf-8"))


def validate_positive_integer(value: int, field: str = "value") -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise ValueError(f"{field} must be a positive integer")
    return value


def normalize_timestamp(value: datetime | None = None) -> datetime:
    if value is None:
        return utc_now()
    if not isinstance(value, datetime):
        raise ValueError("timestamp must be a datetime")
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("timestamp must be timezone-aware")
    return value.astimezone(timezone.utc)
