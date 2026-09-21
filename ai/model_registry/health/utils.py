from __future__ import annotations

from collections.abc import Iterable

from .status import HealthStatus


def is_healthy(status: HealthStatus) -> bool:
    return status == HealthStatus.HEALTHY


def is_available(status: HealthStatus) -> bool:
    return status in {
        HealthStatus.HEALTHY,
        HealthStatus.DEGRADED,
    }


def status_from_failures(
    consecutive_failures: int,
    *,
    degraded_threshold: int = 1,
    unhealthy_threshold: int = 3,
) -> HealthStatus:
    if consecutive_failures < 0:
        raise ValueError(
            "consecutive_failures cannot be negative"
        )

    if degraded_threshold <= 0:
        raise ValueError(
            "degraded_threshold must be greater than zero"
        )

    if unhealthy_threshold <= degraded_threshold:
        raise ValueError(
            "unhealthy_threshold must be greater than "
            "degraded_threshold"
        )

    if consecutive_failures >= unhealthy_threshold:
        return HealthStatus.UNHEALTHY

    if consecutive_failures >= degraded_threshold:
        return HealthStatus.DEGRADED

    return HealthStatus.HEALTHY


def average_latency(
    latencies: Iterable[float],
) -> float | None:
    values = list(latencies)

    if not values:
        return None

    if any(value < 0 for value in values):
        raise ValueError(
            "latency values cannot be negative"
        )

    return sum(values) / len(values)


def availability_ratio(
    statuses: Iterable[HealthStatus],
) -> float:
    values = list(statuses)

    if not values:
        return 0.0

    available = sum(
        1
        for status in values
        if is_available(status)
    )

    return available / len(values)


__all__ = [
    "is_healthy",
    "is_available",
    "status_from_failures",
    "average_latency",
    "availability_ratio",
]
