from __future__ import annotations

from enum import Enum


class HealthStatus(str, Enum):
    UNKNOWN = "unknown"
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    DISABLED = "disabled"


class HealthCheckResult:
    def __init__(
        self,
        status: HealthStatus,
        *,
        message: str = "",
        latency_ms: float | None = None,
    ) -> None:
        if not isinstance(status, HealthStatus):
            raise TypeError(
                "status must be a HealthStatus"
            )

        if latency_ms is not None and latency_ms < 0:
            raise ValueError(
                "latency_ms cannot be negative"
            )

        self.status = status
        self.message = message
        self.latency_ms = latency_ms

    @property
    def healthy(self) -> bool:
        return self.status == HealthStatus.HEALTHY

    @property
    def available(self) -> bool:
        return self.status in {
            HealthStatus.HEALTHY,
            HealthStatus.DEGRADED,
        }


__all__ = [
    "HealthStatus",
    "HealthCheckResult",
]
