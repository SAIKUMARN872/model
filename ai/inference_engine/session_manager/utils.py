from __future__ import annotations

from typing import Any


def normalize_session_id(session_id: str) -> str:
    """Normalize a session identifier."""

    normalized = session_id.strip()

    if not normalized:
        raise ValueError("session_id cannot be empty.")

    return normalized


def copy_message(
    message: dict[str, Any],
) -> dict[str, Any]:
    """Create a shallow copy of a session message."""

    return dict(message)


__all__ = [
    "normalize_session_id",
    "copy_message",
]
