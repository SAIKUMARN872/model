"""Validation helpers for episodic memory."""
from __future__ import annotations

import hashlib
import json
import math
import re
from datetime import datetime, timezone
from typing import Any, Mapping

from ai.memory.exceptions import MemoryValidationError

_EVENT_TYPE = re.compile(r"^[a-z][a-z0-9_.:-]{0,99}$")
_MAX_CONTENT = 100_000
_MAX_METADATA_BYTES = 32_768


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def validate_identifier(value: str, field: str) -> str:
    if not isinstance(value, str):
        raise MemoryValidationError(f"{field} must be a string")
    value = value.strip()
    if not value or len(value) > 200 or any(ord(c) < 32 for c in value):
        raise MemoryValidationError(f"{field} is invalid")
    return value


def normalize_event_type(value: str) -> str:
    if not isinstance(value, str):
        raise MemoryValidationError("event_type must be a string")
    value = value.strip().lower()
    if not _EVENT_TYPE.fullmatch(value):
        raise MemoryValidationError("event_type is invalid")
    return value


def normalize_content(value: str) -> str:
    if not isinstance(value, str):
        raise MemoryValidationError("content must be a string")
    value = value.strip()
    if not value or len(value) > _MAX_CONTENT:
        raise MemoryValidationError("content is empty or too long")
    return value


def normalize_datetime(value: datetime | None) -> datetime:
    if value is None:
        return utc_now()
    if not isinstance(value, datetime):
        raise MemoryValidationError("timestamp must be a datetime")
    if value.tzinfo is None or value.utcoffset() is None:
        raise MemoryValidationError("timestamp must be timezone-aware")
    return value.astimezone(timezone.utc)


def validate_metadata(value: Mapping[str, Any] | None) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, Mapping):
        raise MemoryValidationError("metadata must be a mapping")
    try:
        encoded = json.dumps(
            dict(value), ensure_ascii=False, allow_nan=False,
            sort_keys=True, separators=(",", ":"),
        )
        if len(encoded.encode("utf-8")) > _MAX_METADATA_BYTES:
            raise MemoryValidationError("metadata is too large")
        return json.loads(encoded)
    except MemoryValidationError:
        raise
    except (TypeError, ValueError, RecursionError) as exc:
        raise MemoryValidationError("metadata must be JSON-safe") from exc


def validate_score(value: float, field: str = "importance") -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise MemoryValidationError(f"{field} must be numeric")
    value = float(value)
    if not math.isfinite(value) or not 0 <= value <= 1:
        raise MemoryValidationError(f"{field} must be between 0 and 1")
    return value


def event_fingerprint(
    tenant_id: str, user_id: str, event_type: str,
    content: str, occurred_at: datetime,
) -> str:
    raw = json.dumps(
        [tenant_id, user_id, event_type, content, occurred_at.isoformat()],
        ensure_ascii=False, separators=(",", ":"),
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
