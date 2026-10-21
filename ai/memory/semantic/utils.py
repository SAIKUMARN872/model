from __future__ import annotations

import json
import math
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Mapping


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def validate_identifier(value: str, name: str = "identifier") -> str:
    if not isinstance(value, str):
        raise ValueError(f"{name} must be a string")
    value = value.strip()
    if not value or len(value) > 200:
        raise ValueError(f"{name} must contain 1-200 characters")
    if any(ord(ch) < 32 for ch in value):
        raise ValueError(f"{name} contains control characters")
    return value


def validate_text(value: str, name: str = "text", max_length: int = 100_000) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{name} must be a string")
    value = value.strip()
    if not value:
        raise ValueError(f"{name} cannot be empty")
    if len(value) > max_length:
        raise ValueError(f"{name} exceeds {max_length} characters")
    return value


def validate_confidence(value: float, name: str = "confidence") -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be numeric")
    value = float(value)
    if not math.isfinite(value) or not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be finite and between 0 and 1")
    return value


def validate_metadata(value: Mapping[str, Any] | None) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, Mapping):
        raise ValueError("metadata must be a mapping")
    try:
        encoded = json.dumps(dict(value), allow_nan=False, ensure_ascii=False)
        if len(encoded.encode("utf-8")) > 64_000:
            raise ValueError("metadata exceeds 64000 bytes")
        decoded = json.loads(encoded)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError(f"metadata must be JSON-safe: {exc}") from exc
    if not isinstance(decoded, dict):
        raise ValueError("metadata must be a JSON object")
    return decoded


def new_knowledge_id() -> str:
    return str(uuid.uuid4())


def lexical_tokens(value: str) -> set[str]:
    return {
        token.casefold()
        for token in re.findall(r"[a-zA-Z0-9_]{2,}", value)
    }


def normalize_timestamp(value: datetime, name: str = "timestamp") -> datetime:
    if not isinstance(value, datetime):
        raise ValueError(f"{name} must be a datetime")
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{name} must be timezone-aware")
    return value.astimezone(timezone.utc)
