from __future__ import annotations

from decimal import Decimal
from typing import List, Optional

from .models import (
    AlertSeverity,
    AlertStatus,
    SpendAlert,
    SpendAlertRule,
)


class SpendAlertStore:
    """Stores spend alert rules and triggered alerts."""

    def __init__(self) -> None:
        self._rules: dict[str, SpendAlertRule] = {}
        self._alerts: dict[str, SpendAlert] = {}

    def add_rule(self, rule: SpendAlertRule) -> SpendAlertRule:
        if not rule.rule_id.strip():
            raise ValueError("rule_id must not be empty")

        if not rule.name.strip():
            raise ValueError("name must not be empty")

        if rule.threshold < Decimal("0"):
            raise ValueError("threshold must not be negative")

        self._rules[rule.rule_id] = rule
        return rule

    def get_rule(self, rule_id: str) -> Optional[SpendAlertRule]:
        return self._rules.get(rule_id)

    def require_rule(self, rule_id: str) -> SpendAlertRule:
        rule = self.get_rule(rule_id)

        if rule is None:
            raise KeyError(f"Spend alert rule not found: {rule_id}")

        return rule

    def list_rules(self) -> List[SpendAlertRule]:
        return list(self._rules.values())

    def enabled_rules(self) -> List[SpendAlertRule]:
        return [
            rule
            for rule in self._rules.values()
            if rule.enabled
        ]

    def remove_rule(self, rule_id: str) -> None:
        if rule_id not in self._rules:
            raise KeyError(f"Spend alert rule not found: {rule_id}")

        del self._rules[rule_id]

    def add_alert(self, alert: SpendAlert) -> SpendAlert:
        if not alert.alert_id.strip():
            raise ValueError("alert_id must not be empty")

        if not alert.rule_id.strip():
            raise ValueError("rule_id must not be empty")

        if alert.current_spend < Decimal("0"):
            raise ValueError("current_spend must not be negative")

        if alert.threshold < Decimal("0"):
            raise ValueError("threshold must not be negative")

        self._alerts[alert.alert_id] = alert
        return alert

    def get_alert(self, alert_id: str) -> Optional[SpendAlert]:
        return self._alerts.get(alert_id)

    def require_alert(self, alert_id: str) -> SpendAlert:
        alert = self.get_alert(alert_id)

        if alert is None:
            raise KeyError(f"Spend alert not found: {alert_id}")

        return alert

    def list_alerts(self) -> List[SpendAlert]:
        return list(self._alerts.values())

    def active_alerts(self) -> List[SpendAlert]:
        return [
            alert
            for alert in self._alerts.values()
            if alert.status == AlertStatus.ACTIVE
        ]

    def alerts_by_severity(
        self,
        severity: AlertSeverity,
    ) -> List[SpendAlert]:
        return [
            alert
            for alert in self._alerts.values()
            if alert.severity == severity
        ]

    def acknowledge(self, alert_id: str) -> SpendAlert:
        alert = self.require_alert(alert_id)

        updated = SpendAlert(
            alert_id=alert.alert_id,
            rule_id=alert.rule_id,
            current_spend=alert.current_spend,
            threshold=alert.threshold,
            severity=alert.severity,
            status=AlertStatus.ACKNOWLEDGED,
            currency=alert.currency,
            model=alert.model,
            provider=alert.provider,
            entity_id=alert.entity_id,
            message=alert.message,
            triggered_at=alert.triggered_at,
            metadata=alert.metadata,
        )

        self._alerts[alert_id] = updated
        return updated

    def resolve(self, alert_id: str) -> SpendAlert:
        alert = self.require_alert(alert_id)

        updated = SpendAlert(
            alert_id=alert.alert_id,
            rule_id=alert.rule_id,
            current_spend=alert.current_spend,
            threshold=alert.threshold,
            severity=alert.severity,
            status=AlertStatus.RESOLVED,
            currency=alert.currency,
            model=alert.model,
            provider=alert.provider,
            entity_id=alert.entity_id,
            message=alert.message,
            triggered_at=alert.triggered_at,
            metadata=alert.metadata,
        )

        self._alerts[alert_id] = updated
        return updated

    def rule_count(self) -> int:
        return len(self._rules)

    def alert_count(self) -> int:
        return len(self._alerts)

    def clear(self) -> None:
        self._rules.clear()
        self._alerts.clear()


__all__ = ["SpendAlertStore"]
