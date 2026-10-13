from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from typing import Any, Mapping


MAX_IDENTIFIER_LENGTH = 200
MAX_JSON_BYTES = 1_048_576


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def validate_identifier(value: str, field: str = "identifier") -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field} must be a string")

    value = value.strip()
    if not value or len(value) > MAX_IDENTIFIER_LENGTH:
        raise ValueError(f"{field} must contain 1-{MAX_IDENTIFIER_LENGTH} characters")

    if any(ord(ch) < 32 or ord(ch) == 127 for ch in value):
        raise ValueError(f"{field} contains control characters")

    return value


def validate_json_value(value: Any, max_bytes: int = MAX_JSON_BYTES) -> Any:
    try:
        encoded = json.dumps(
            value,
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError("value must be finite JSON-compatible data") from exc

    if len(encoded) > max_bytes:
        raise ValueError("serialized JSON exceeds maximum size")

    return json.loads(encoded.decode("utf-8"))


def validate_metadata(value: Mapping[str, Any] | None) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, Mapping):
        raise ValueError("metadata must be a mapping")

    result = validate_json_value(dict(value), max_bytes=65536)
    if not isinstance(result, dict):
        raise ValueError("metadata must be a JSON object")
    return result


def normalize_timestamp(value: datetime | None = None) -> datetime:
    if value is None:
        return utc_now()
    if not isinstance(value, datetime):
        raise ValueError("timestamp must be a datetime")
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("timestamp must be timezone-aware")
    return value.astimezone(timezone.utc)


def timestamp_to_text(value: datetime | None = None) -> str:
    return normalize_timestamp(value).isoformat()


def parse_timestamp(value: str) -> datetime:
    if not isinstance(value, str):
        raise ValueError("timestamp must be an ISO-8601 string")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("invalid ISO-8601 timestamp") from exc
    return normalize_timestamp(parsed)


def validate_vector(vector: Any, *, max_dimensions: int = 16384) -> list[float]:
    if not isinstance(vector, (list, tuple)) or not vector:
        raise ValueError("vector must be a non-empty list or tuple")
    if len(vector) > max_dimensions:
        raise ValueError("vector exceeds maximum dimensions")

    result = []
    for component in vector:
        if isinstance(component, bool) or not isinstance(component, (int, float)):
            raise ValueError("vector components must be numeric")
        number = float(component)
        if not math.isfinite(number):
            raise ValueError("vector components must be finite")
        result.append(number)
    return result
