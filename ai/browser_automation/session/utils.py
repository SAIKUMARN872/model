"""
Session utility functions.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    """Return current UTC timestamp."""

    return datetime.now(
        timezone.utc
    )


def merge_context(
    current: dict[str, Any],
    updates: dict[str, Any],
) -> dict[str, Any]:
    """Return a merged context without mutating the original."""

    if not isinstance(
        current,
        dict,
    ):

        raise TypeError(
            "current must be a dictionary."
        )

    if not isinstance(
        updates,
        dict,
    ):

        raise TypeError(
            "updates must be a dictionary."
        )

    result = dict(
        current
    )

    result.update(
        updates
    )

    return result


def serialize_datetime(
    value: datetime | None,
) -> str | None:

    if value is None:
        return None

    return value.astimezone(
        timezone.utc
    ).isoformat()


def session_duration_seconds(
    started_at: datetime | None,
    completed_at: datetime | None = None,
) -> float:

    if started_at is None:

        return 0.0

    end = (
        completed_at
        or utc_now()
    )

    return max(
        0.0,
        (
            end - started_at
        ).total_seconds(),
    )


def safe_session_id(
    session_id: str,
) -> str:

    if not isinstance(
        session_id,
        str,
    ):

        raise TypeError(
            "session_id must be a string."
        )

    session_id = session_id.strip()

    if not session_id:

        raise ValueError(
            "session_id cannot be empty."
        )

    return session_id