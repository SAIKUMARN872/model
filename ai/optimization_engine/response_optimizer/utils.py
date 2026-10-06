"""Utility helpers for ModelNow response optimization."""

from __future__ import annotations

import hashlib
import json
from typing import Any, Mapping, Sequence


def estimate_tokens(text: str) -> int:
    """Estimate token count using a lightweight word/subword heuristic."""
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    text = text.strip()
    if not text:
        return 0

    words = text.split()
    return max(1, int(round(len(words) * 1.3)))


def estimate_characters(text: str) -> int:
    """Return the number of characters in a response."""
    if not isinstance(text, str):
        raise TypeError("text must be a string")
    return len(text)


def calculate_compression_ratio(
    original: str,
    optimized: str,
) -> float:
    """Calculate the proportion of characters removed."""
    if not isinstance(original, str) or not isinstance(optimized, str):
        raise TypeError("original and optimized must be strings")

    if not original:
        return 0.0

    return max(0.0, (len(original) - len(optimized)) / len(original))


def calculate_reduction(
    original: int,
    optimized: int,
) -> float:
    """Calculate a bounded reduction ratio."""
    if original < 0 or optimized < 0:
        raise ValueError("values must be non-negative")

    if original == 0:
        return 0.0

    return max(0.0, (original - optimized) / original)


def response_id(
    content: str,
    *,
    request_id: str | None = None,
) -> str:
    """Create a deterministic response identifier."""
    if not isinstance(content, str):
        raise TypeError("content must be a string")

    payload = {
        "content": content,
        "request_id": request_id or "",
    }

    encoded = json.dumps(
        payload,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")

    return hashlib.sha256(encoded).hexdigest()[:16]


def merge_metadata(
    *metadata: Mapping[str, Any] | None,
) -> dict[str, Any]:
    """Merge response metadata mappings from left to right."""
    result: dict[str, Any] = {}

    for item in metadata:
        if item is None:
            continue
        if not isinstance(item, Mapping):
            raise TypeError("metadata entries must be mappings")
        result.update(item)

    return result


def normalize_choices(
    choices: Sequence[Any] | None,
) -> list[str]:
    """Normalize response choices into strings."""
    if choices is None:
        return []

    return [str(choice) for choice in choices]


__all__ = [
    "calculate_compression_ratio",
    "calculate_reduction",
    "estimate_characters",
    "estimate_tokens",
    "merge_metadata",
    "normalize_choices",
    "response_id",
]
