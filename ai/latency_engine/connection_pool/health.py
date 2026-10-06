from __future__ import annotations

from dataclasses import dataclass
from time import monotonic
from typing import Callable, Generic, TypeVar


T = TypeVar("T")


@dataclass(frozen=True)
class HealthCheckResult:
    healthy: bool
    latency_ms: float
    error: str | None = None


@dataclass(frozen=True)
class HealthStatistics:
    checks: int
    healthy: int
    unhealthy: int
    success_rate: float
    average_latency_ms: float


class ConnectionHealthChecker(Generic[T]):
    """Performs lightweight health checks for pooled connections."""

    def __init__(
        self,
        checker: Callable[[T], bool] | None = None,
    ) -> None:
        self._checker = checker
        self._checks = 0
        self._healthy = 0
        self._unhealthy = 0
        self._latency_total_ms = 0.0

    def check(self, connection: T) -> HealthCheckResult:
        started = monotonic()

        try:
            if self._checker is None:
                healthy = self._default_check(connection)
            else:
                healthy = bool(self._checker(connection))

            latency_ms = (monotonic() - started) * 1000.0

            self._checks += 1
            self._latency_total_ms += latency_ms

            if healthy:
                self._healthy += 1
            else:
                self._unhealthy += 1

            return HealthCheckResult(
                healthy=healthy,
                latency_ms=latency_ms,
            )

        except Exception as exc:
            latency_ms = (monotonic() - started) * 1000.0

            self._checks += 1
            self._unhealthy += 1
            self._latency_total_ms += latency_ms

            return HealthCheckResult(
                healthy=False,
                latency_ms=latency_ms,
                error=str(exc),
            )

    @staticmethod
    def _default_check(connection: T) -> bool:
        """Use common provider/client health methods when available."""

        ping = getattr(connection, "ping", None)

        if callable(ping):
            result = ping()
            return True if result is None else bool(result)

        health_check = getattr(connection, "health_check", None)

        if callable(health_check):
            result = health_check()
            return True if result is None else bool(result)

        is_healthy = getattr(connection, "healthy", None)

        if is_healthy is not None:
            return bool(is_healthy)

        # A generic connection object is considered usable unless
        # it explicitly reports an unhealthy state.
        return True

    def check_many(
        self,
        connections: list[T],
    ) -> list[HealthCheckResult]:
        return [
            self.check(connection)
            for connection in connections
        ]

    @property
    def statistics(self) -> HealthStatistics:
        average_latency = (
            self._latency_total_ms / self._checks
            if self._checks
            else 0.0
        )

        success_rate = (
            self._healthy / self._checks
            if self._checks
            else 0.0
        )

        return HealthStatistics(
            checks=self._checks,
            healthy=self._healthy,
            unhealthy=self._unhealthy,
            success_rate=success_rate,
            average_latency_ms=average_latency,
        )

    def reset(self) -> None:
        self._checks = 0
        self._healthy = 0
        self._unhealthy = 0
        self._latency_total_ms = 0.0


__all__ = [
    "HealthCheckResult",
    "HealthStatistics",
    "ConnectionHealthChecker",
]
