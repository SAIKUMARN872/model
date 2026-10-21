from __future__ import annotations

import json
import math
import re
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any


_IDENTIFIER_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:@/-]{0,127}$")
MAX_METADATA_BYTES = 16_384
MAX_STATE_BYTES = 1_048_576


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def validate_identifier(value: str, field_name: str = "identifier") -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string")
    value = value.strip()
    if not _IDENTIFIER_PATTERN.fullmatch(value):
        raise ValueError(f"Invalid {field_name}")
    return value


def validate_optional_identifier(
    value: str | None, field_name: str = "identifier"
) -> str | None:
    if value is None:
        return None
    return validate_identifier(value, field_name)


def json_safe_copy(
    value: Any,
    *,
    field_name: str = "value",
    max_bytes: int = MAX_STATE_BYTES,
) -> Any:
    if isinstance(max_bytes, bool) or not isinstance(max_bytes, int) or max_bytes < 1:
        raise ValueError("max_bytes must be a positive integer")

    try:
        encoded = json.dumps(
            value,
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        )
        if len(encoded.encode("utf-8")) > max_bytes:
            raise ValueError(f"{field_name} exceeds the size limit")
        result = json.loads(encoded)
    except (TypeError, OverflowError) as exc:
        raise ValueError(f"{field_name} must contain JSON-compatible values") from exc

    return result


def validate_metadata(metadata: dict[str, Any] | None) -> dict[str, Any]:
    if metadata is None:
        return {}
    if not isinstance(metadata, dict):
        raise ValueError("metadata must be a dictionary")
    result = json_safe_copy(
        metadata,
        field_name="metadata",
        max_bytes=MAX_METADATA_BYTES,
    )
    if not all(isinstance(key, str) for key in result):
        raise ValueError("metadata keys must be strings")
    return result


def validate_state(state: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(state, dict):
        raise ValueError("state must be a dictionary")
    result = json_safe_copy(state, field_name="state")
    if not all(isinstance(key, str) and key.strip() for key in result):
        raise ValueError("state keys must be non-empty strings")
    return result


def validate_positive_int(value: int, field_name: str, maximum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f"{field_name} must be an integer")
    if value < 1 or value > maximum:
        raise ValueError(f"{field_name} must be between 1 and {maximum}")
    return value


def deep_copy(value: Any) -> Any:
    return deepcopy(value)


def finite_number(value: float, field_name: str = "value") -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{field_name} must be a number")
    if not math.isfinite(value):
        raise ValueError(f"{field_name} must be finite")
    return float(value)
