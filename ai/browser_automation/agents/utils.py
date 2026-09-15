"""
Utilities shared by browser automation agents.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    """Return current UTC time."""

    return datetime.now(
        timezone.utc
    )


def clean_text(
    text: str,
) -> str:

    if not text:
        return ""

    lines = [
        line.strip()
        for line in text.splitlines()
    ]

    return "\n".join(
        line
        for line in lines
        if line
    )


def normalize_links(
    links: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    result = []

    seen = set()

    for link in links:

        url = str(
            link.get(
                "url",
                ""
            )
        ).strip()

        if not url or url in seen:
            continue

        seen.add(url)

        result.append(
            {
                "title": str(
                    link.get(
                        "title",
                        ""
                    )
                ).strip(),
                "url": url,
            }
        )

    return result


def build_result(
    *,
    success: bool,
    data: Any = None,
    error: str | None = None,
) -> dict[str, Any]:

    return {
        "success": success,
        "data": data,
        "error": error,
        "timestamp": (
            utc_now().isoformat()
        ),
    }


async def safe_close(
    resource: Any,
) -> None:

    if resource is None:
        return

    close = getattr(
        resource,
        "close",
        None,
    )

    if close is None:
        return

    result = close()

    if hasattr(
        result,
        "__await__",
    ):

        await result