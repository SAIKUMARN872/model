from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from threading import Lock


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"


@dataclass(frozen=True)
class LatencyAlert:
    alert_id: str
    name: str
    severity: AlertSeverity
    status: AlertStatus
    actual_latency_ms: float
    threshold_ms: float
    message: str
    request_id: str | None = None
    metadata: dict[str, object] | None = None


class LatencyAlertManager:
    """Creates and tracks latency alerts."""

    def __init__(self) -> None:
        self._alerts: dict[str, LatencyAlert] = {}
        self._lock = Lock()

    @staticmethod
    def _validate_id(value: str, field_name: str) -> str:
        normalized = str(value).strip()

        if not normalized:
            raise ValueError(
                f"{field_name} cannot be empty"
            )

        return normalized

    @staticmethod
    def _validate_latency(
        value: float,
        field_name: str,
    ) -> float:
        result = float(value)

        if result < 0:
            raise ValueError(
                f"{field_name} cannot be negative"
            )

        return result

    def evaluate(
        self,
        *,
        alert_id: str,
        name: str,
        latency_ms: float,
        threshold_ms: float,
        request_id: str | None = None,
        severity: AlertSeverity = AlertSeverity.WARNING,
        metadata: dict[str, object] | None = None,
    ) -> LatencyAlert | None:
        alert_id = self._validate_id(
            alert_id,
            "alert_id",
        )

        name = self._validate_id(
            name,
            "name",
        )

        actual = self._validate_latency(
            latency_ms,
            "latency_ms",
        )

        threshold = self._validate_latency(
            threshold_ms,
            "threshold_ms",
        )

        if request_id is not None:
            request_id = self._validate_id(
                request_id,
                "request_id",
            )

        if actual <= threshold:
            self.resolve(alert_id)
            return None

        alert = LatencyAlert(
            alert_id=alert_id,
            name=name,
            severity=severity,
            status=AlertStatus.ACTIVE,
            actual_latency_ms=actual,
            threshold_ms=threshold,
            message=(
                f"{name} latency exceeded threshold: "
                f"{actual:.2f}ms > {threshold:.2f}ms"
            ),
            request_id=request_id,
            metadata=dict(metadata or {}),
        )

        with self._lock:
            self._alerts[alert_id] = alert

        return alert

    def resolve(
        self,
        alert_id: str,
    ) -> LatencyAlert | None:
        alert_id = self._validate_id(
            alert_id,
            "alert_id",
        )

        with self._lock:
            existing = self._alerts.get(alert_id)

            if existing is None:
                return None

            resolved = LatencyAlert(
                alert_id=existing.alert_id,
                name=existing.name,
                severity=existing.severity,
                status=AlertStatus.RESOLVED,
                actual_latency_ms=existing.actual_latency_ms,
                threshold_ms=existing.threshold_ms,
                message=existing.message,
                request_id=existing.request_id,
                metadata=dict(
                    existing.metadata or {}
                ),
            )

            self._alerts[alert_id] = resolved

            return resolved

    def get(
        self,
        alert_id: str,
    ) -> LatencyAlert | None:
        alert_id = self._validate_id(
            alert_id,
            "alert_id",
        )

        with self._lock:
            return self._alerts.get(alert_id)

    def active(self) -> tuple[LatencyAlert, ...]:
        with self._lock:
            return tuple(
                alert
                for alert in self._alerts.values()
                if alert.status == AlertStatus.ACTIVE
            )

    def resolved(self) -> tuple[LatencyAlert, ...]:
        with self._lock:
            return tuple(
                alert
                for alert in self._alerts.values()
                if alert.status == AlertStatus.RESOLVED
            )

    def all(self) -> tuple[LatencyAlert, ...]:
        with self._lock:
            return tuple(self._alerts.values())

    def clear(self) -> None:
        with self._lock:
            self._alerts.clear()


__all__ = [
    "AlertSeverity",
    "AlertStatus",
    "LatencyAlert",
    "LatencyAlertManager",
]
