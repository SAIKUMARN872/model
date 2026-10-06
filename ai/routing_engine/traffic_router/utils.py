from __future__ import annotations

from collections.abc import Iterable
from uuid import uuid4

from ai.routing_engine.models import ModelCandidate

from .queues import QueuePriority


def normalize_request_id(request_id: str | None) -> str:
    """Return a normalized request ID or generate one."""
    if request_id is None:
        return uuid4().hex

    normalized = str(request_id).strip()

    if not normalized:
        return uuid4().hex

    return normalized


def normalize_priority(
    priority: QueuePriority | int | str | None,
) -> QueuePriority:
    """Normalize supported priority representations."""
    if priority is None:
        return QueuePriority.NORMAL

    if isinstance(priority, QueuePriority):
        return priority

    if isinstance(priority, int):
        return QueuePriority(priority)

    value = str(priority).strip().lower()

    aliases = {
        "low": QueuePriority.LOW,
        "normal": QueuePriority.NORMAL,
        "medium": QueuePriority.NORMAL,
        "high": QueuePriority.HIGH,
        "critical": QueuePriority.CRITICAL,
    }

    if value in aliases:
        return aliases[value]

    raise ValueError(
        f"Unsupported queue priority: {priority}"
    )


def target_key(candidate: ModelCandidate) -> str:
    """Build a stable provider/model target key."""
    if not isinstance(candidate, ModelCandidate):
        raise TypeError(
            "candidate must be a ModelCandidate"
        )

    provider = candidate.provider.strip()
    model_id = candidate.model_id.strip()

    if not provider:
        raise ValueError(
            "candidate provider must be non-empty"
        )

    if not model_id:
        raise ValueError(
            "candidate model_id must be non-empty"
        )

    return f"{provider}:{model_id}"


def calculate_capacity(
    active_requests: int,
    capacity: int | None,
) -> int | None:
    """Return remaining capacity for a target."""
    if active_requests < 0:
        raise ValueError(
            "active_requests cannot be negative"
        )

    if capacity is None:
        return None

    if capacity < 0:
        raise ValueError(
            "capacity cannot be negative"
        )

    return max(0, capacity - active_requests)


def has_capacity(
    active_requests: int,
    capacity: int | None,
) -> bool:
    """Return whether a target can accept another request."""
    remaining = calculate_capacity(
        active_requests,
        capacity,
    )

    return remaining is None or remaining > 0


def filter_candidates(
    candidates: Iterable[ModelCandidate],
) -> list[ModelCandidate]:
    """Keep only enabled candidates."""
    return [
        candidate
        for candidate in candidates
        if isinstance(candidate, ModelCandidate)
        and candidate.enabled
    ]


def candidate_target_keys(
    candidates: Iterable[ModelCandidate],
) -> tuple[str, ...]:
    """Return unique stable target keys."""
    keys: list[str] = []
    seen: set[str] = set()

    for candidate in candidates:
        key = target_key(candidate)

        if key not in seen:
            seen.add(key)
            keys.append(key)

    return tuple(keys)


__all__ = [
    "calculate_capacity",
    "candidate_target_keys",
    "filter_candidates",
    "has_capacity",
    "normalize_priority",
    "normalize_request_id",
    "target_key",
]
