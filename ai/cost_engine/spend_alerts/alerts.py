"""
Spend alert models and alert management.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from threading import RLock
from typing import Any
from uuid import uuid4

from .rules import (
    AlertMetric,
    AlertRule,
    AlertSeverity,
)


class AlertStatus(str, Enum):
    """Alert lifecycle status."""

    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


@dataclass
class SpendAlert:
    """
    Represents a triggered spend alert.
    """

    alert_id: str

    rule_name: str

    metric: AlertMetric
    severity: AlertSeverity

    value: Decimal
    threshold: Decimal

    message: str

    scope_id: str | None = None

    currency: str = "USD"

    status: AlertStatus = AlertStatus.OPEN

    created_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    acknowledged_at: datetime | None = None
    resolved_at: datetime | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def acknowledge(self) -> None:

        self.status = AlertStatus.ACKNOWLEDGED

        self.acknowledged_at = (
            datetime.now(timezone.utc)
        )

    def resolve(self) -> None:

        self.status = AlertStatus.RESOLVED

        self.resolved_at = (
            datetime.now(timezone.utc)
        )

    def dismiss(self) -> None:

        self.status = AlertStatus.DISMISSED

        self.resolved_at = (
            datetime.now(timezone.utc)
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "alert_id": self.alert_id,
            "rule_name": self.rule_name,
            "metric": self.metric.value,
            "severity": self.severity.value,
            "value": str(self.value),
            "threshold": str(self.threshold),
            "message": self.message,
            "scope_id": self.scope_id,
            "currency": self.currency,
            "status": self.status.value,
            "created_at": (
                self.created_at.isoformat()
            ),
            "acknowledged_at": (
                self.acknowledged_at.isoformat()
                if self.acknowledged_at
                else None
            ),
            "resolved_at": (
                self.resolved_at.isoformat()
                if self.resolved_at
                else None
            ),
            "metadata": self.metadata,
        }


class AlertManager:
    """
    Thread-safe alert manager.

    Handles creation, lookup, acknowledgement,
    resolution, dismissal, and filtering.
    """

    def __init__(self) -> None:

        self._alerts: dict[
            str,
            SpendAlert,
        ] = {}

        self._lock = RLock()

    def create(
        self,
        rule: AlertRule,
        value: Decimal | int | float | str,
        message: str | None = None,
        scope_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> SpendAlert:

        value = Decimal(str(value))

        alert = SpendAlert(
            alert_id=str(uuid4()),
            rule_name=rule.name,
            metric=rule.metric,
            severity=rule.severity,
            value=value,
            threshold=rule.threshold,
            message=(
                message
                or f"Alert triggered for {rule.name}"
            ),
            scope_id=(
                scope_id
                if scope_id is not None
                else rule.scope_id
            ),
            currency=rule.currency,
            metadata=metadata or {},
        )

        with self._lock:
            self._alerts[
                alert.alert_id
            ] = alert

        return alert

    def get(
        self,
        alert_id: str,
    ) -> SpendAlert | None:

        with self._lock:
            return self._alerts.get(
                alert_id
            )

    def require(
        self,
        alert_id: str,
    ) -> SpendAlert:

        alert = self.get(alert_id)

        if alert is None:
            raise KeyError(
                f"Alert not found: {alert_id}"
            )

        return alert

    def acknowledge(
        self,
        alert_id: str,
    ) -> SpendAlert:

        with self._lock:

            alert = self.require(
                alert_id
            )

            alert.acknowledge()

            return alert

    def resolve(
        self,
        alert_id: str,
    ) -> SpendAlert:

        with self._lock:

            alert = self.require(
                alert_id
            )

            alert.resolve()

            return alert

    def dismiss(
        self,
        alert_id: str,
    ) -> SpendAlert:

        with self._lock:

            alert = self.require(
                alert_id
            )

            alert.dismiss()

            return alert

    def all_alerts(
        self,
    ) -> list[SpendAlert]:

        with self._lock:
            return list(
                self._alerts.values()
            )

    def open_alerts(
        self,
    ) -> list[SpendAlert]:

        return [
            alert
            for alert in self.all_alerts()
            if alert.status
            in {
                AlertStatus.OPEN,
                AlertStatus.ACKNOWLEDGED,
            }
        ]

    def by_severity(
        self,
        severity: AlertSeverity,
    ) -> list[SpendAlert]:

        return [
            alert
            for alert in self.all_alerts()
            if alert.severity == severity
        ]

    def by_scope(
        self,
        scope_id: str,
    ) -> list[SpendAlert]:

        return [
            alert
            for alert in self.all_alerts()
            if alert.scope_id == scope_id
        ]

    def by_rule(
        self,
        rule_name: str,
    ) -> list[SpendAlert]:

        return [
            alert
            for alert in self.all_alerts()
            if alert.rule_name == rule_name
        ]

    def clear(
        self,
    ) -> None:

        with self._lock:
            self._alerts.clear()