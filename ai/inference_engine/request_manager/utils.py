from __future__ import annotations

from typing import Any


def normalize_messages(
    messages: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Return independent message dictionaries."""

    return [
        dict(message)
        for message in messages
    ]


def normalize_metadata(
    metadata: dict[str, Any] | None,
) -> dict[str, Any]:
    """Return a safe metadata dictionary."""

    return dict(metadata or {})


__all__ = [
    "normalize_messages",
    "normalize_metadata",
]
