from __future__ import annotations

import re
from typing import Any, Mapping


def validate_citation_id(citation_id: str) -> str:
    """Validate and normalize a citation identifier."""
    if not isinstance(citation_id, str):
        raise TypeError("Citation ID must be a string.")

    normalized = citation_id.strip()
    if not normalized:
        raise ValueError("Citation ID cannot be empty.")
    if len(normalized) > 128:
        raise ValueError("Citation ID cannot exceed 128 characters.")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.:-]*", normalized):
        raise ValueError("Citation ID contains unsupported characters.")

    return normalized


def metadata_value(
    metadata: Mapping[str, Any],
    *keys: str,
) -> str | None:
    """Return the first non-empty metadata value as text."""
    for key in keys:
        value = metadata.get(key)
        if value is None:
            continue

        normalized = str(value).strip()
        if normalized:
            return normalized

    return None


def citation_marker(citation_id: str) -> str:
    """Create an inline citation marker, for example [1]."""
    return f"[{validate_citation_id(citation_id)}]"


__all__ = [
    "validate_citation_id",
    "metadata_value",
    "citation_marker",
]
