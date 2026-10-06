from __future__ import annotations

from typing import Any


def get_content(
    response: dict[str, Any],
) -> str:
    """Safely retrieve response content."""

    return str(
        response.get("content", "")
    )


def get_metadata(
    response: dict[str, Any],
) -> dict[str, Any]:
    """Safely retrieve response metadata."""

    metadata = response.get(
        "metadata",
        {},
    )

    return dict(metadata or {})


__all__ = [
    "get_content",
    "get_metadata",
]
