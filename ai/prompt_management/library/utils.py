from __future__ import annotations

import json
import re
from typing import Any


def validate_identifier(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    if value != value.strip():
        raise ValueError(f"{field_name} must not contain surrounding whitespace")
    return value


def normalize_text(value: str, field_name: str) -> str:
    if not isinstance(value, str):
        raise TypeError(f"{field_name} must be a string")
    normalized = value.strip()
    if not normalized:
        raise ValueError(f"{field_name} must not be empty")
    return normalized


def normalize_tags(tags: list[str] | tuple[str, ...] | None) -> tuple[str, ...]:
    if tags is None:
        return ()
    if not isinstance(tags, (list, tuple)):
        raise TypeError("tags must be a list or tuple of strings")

    result: list[str] = []
    seen: set[str] = set()

    for tag in tags:
        normalized = normalize_text(tag, "tag")
        key = normalized.casefold()
        if key not in seen:
            result.append(normalized)
            seen.add(key)

    return tuple(result)


def validate_metadata(metadata: dict[str, Any] | None) -> dict[str, Any]:
    if metadata is None:
        return {}
    if not isinstance(metadata, dict):
        raise TypeError("metadata must be a dictionary")

    try:
        encoded = json.dumps(metadata, allow_nan=False)
        decoded = json.loads(encoded)
    except (TypeError, ValueError) as exc:
        raise ValueError("metadata must contain only JSON-compatible values") from exc

    if not isinstance(decoded, dict):
        raise ValueError("metadata must be a JSON object")
    return decoded


def normalize_search_query(query: str) -> str:
    if not isinstance(query, str):
        raise TypeError("query must be a string")
    return re.sub(r"\s+", " ", query).strip().casefold()
