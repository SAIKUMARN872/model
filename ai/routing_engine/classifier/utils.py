"""Utility helpers for the ModelNow request classifier."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any


def normalize_text(text: str) -> str:
    """Normalize text for deterministic keyword matching."""
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    return " ".join(text.lower().strip().split())


def estimate_tokens(text: str) -> int:
    """Return a lightweight token estimate."""
    normalized = normalize_text(text)

    if not normalized:
        return 0

    return max(1, len(normalized) // 4)


def count_keywords(
    text: str,
    keywords: Iterable[str],
) -> int:
    """Count distinct keyword signals present in text."""
    normalized = normalize_text(text)

    if not normalized:
        return 0

    normalized_keywords = {
        normalize_text(keyword)
        for keyword in keywords
        if isinstance(keyword, str) and normalize_text(keyword)
    }

    return sum(
        keyword in normalized
        for keyword in normalized_keywords
    )


def has_any_keyword(
    text: str,
    keywords: Iterable[str],
) -> bool:
    """Return whether any keyword is present."""
    return count_keywords(text, keywords) > 0


def capability_required(
    capabilities: Iterable[str],
    capability: str,
) -> bool:
    """Check whether a capability is required."""
    if not isinstance(capability, str):
        raise TypeError("capability must be a string")

    target = normalize_text(capability)

    return any(
        isinstance(item, str)
        and normalize_text(item) == target
        for item in capabilities
    )


def normalize_capabilities(
    capabilities: Iterable[str],
) -> tuple[str, ...]:
    """Normalize and deterministically order capabilities."""
    if isinstance(capabilities, str):
        capabilities = (capabilities,)

    normalized: set[str] = set()

    for capability in capabilities:
        if not isinstance(capability, str):
            raise TypeError(
                "capabilities must contain strings"
            )

        value = normalize_text(capability)

        if value:
            normalized.add(value)

    return tuple(sorted(normalized))


def extract_message_text(
    messages: Iterable[Mapping[str, Any]],
) -> str:
    """Extract textual content from routing messages."""
    parts: list[str] = []

    for message in messages:
        if not isinstance(message, Mapping):
            raise TypeError(
                "messages must contain mappings"
            )

        content = message.get("content")

        if isinstance(content, str) and content:
            parts.append(content)

    return "\n".join(parts)


def calculate_confidence(signal_count: int) -> float:
    """Convert classifier signal count into a confidence score."""
    if not isinstance(signal_count, int) or isinstance(
        signal_count,
        bool,
    ):
        raise TypeError(
            "signal_count must be an integer"
        )

    if signal_count < 0:
        raise ValueError(
            "signal_count must be non-negative"
        )

    if signal_count >= 2:
        return 0.95

    if signal_count == 1:
        return 0.85

    return 0.65


__all__ = [
    "calculate_confidence",
    "capability_required",
    "count_keywords",
    "estimate_tokens",
    "extract_message_text",
    "has_any_keyword",
    "normalize_capabilities",
    "normalize_text",
]
