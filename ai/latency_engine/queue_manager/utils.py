from __future__ import annotations

from enum import IntEnum


class QueuePriority(IntEnum):
    CRITICAL = 0
    HIGH = 10
    NORMAL = 50
    LOW = 100


def validate_priority(priority: int) -> int:
    if not isinstance(priority, int):
        raise TypeError(
            "priority must be an integer"
        )

    return priority


def clamp_priority(
    priority: int,
    *,
    minimum: int = 0,
    maximum: int = 100,
) -> int:
    priority = validate_priority(priority)

    if minimum > maximum:
        raise ValueError(
            "minimum must not exceed maximum"
        )

    return max(
        minimum,
        min(maximum, priority),
    )


def priority_from_name(
    name: str,
) -> QueuePriority:
    if not isinstance(name, str):
        raise TypeError(
            "name must be a string"
        )

    normalized = name.strip().lower()

    mapping = {
        "critical": QueuePriority.CRITICAL,
        "urgent": QueuePriority.CRITICAL,
        "high": QueuePriority.HIGH,
        "normal": QueuePriority.NORMAL,
        "default": QueuePriority.NORMAL,
        "low": QueuePriority.LOW,
    }

    try:
        return mapping[normalized]
    except KeyError as exc:
        raise ValueError(
            f"unknown priority: {name}"
        ) from exc


def normalize_priority(
    priority: int | str | QueuePriority,
) -> int:
    if isinstance(
        priority,
        QueuePriority,
    ):
        return int(priority)

    if isinstance(priority, str):
        return int(
            priority_from_name(priority)
        )

    return validate_priority(priority)


def calculate_wait_time_ms(
    *,
    queued_at: float,
    current_time: float,
) -> float:
    queued_at = float(queued_at)
    current_time = float(current_time)

    if queued_at < 0.0:
        raise ValueError(
            "queued_at must be nonnegative"
        )

    if current_time < queued_at:
        raise ValueError(
            "current_time must not be earlier than queued_at"
        )

    return (
        current_time - queued_at
    ) * 1000.0


def aging_priority(
    priority: int,
    *,
    wait_time_ms: float,
    aging_interval_ms: float = 1000.0,
) -> int:
    priority = validate_priority(priority)
    wait_time_ms = float(wait_time_ms)
    aging_interval_ms = float(
        aging_interval_ms
    )

    if wait_time_ms < 0.0:
        raise ValueError(
            "wait_time_ms must be nonnegative"
        )

    if aging_interval_ms <= 0.0:
        raise ValueError(
            "aging_interval_ms must be positive"
        )

    boost = int(
        wait_time_ms // aging_interval_ms
    )

    return max(
        0,
        priority - boost,
    )
