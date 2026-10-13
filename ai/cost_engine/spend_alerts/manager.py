from __future__ import annotations

from decimal import Decimal
from typing import List, Optional

from .alerts import SpendAlertStore
from .evaluator import SpendAlertEvaluator
from .models import (
    AlertSeverity,
    AlertStatus,
    SpendAlert,
    SpendAlertRule,
    SpendAlertSummary,
)


class SpendAlertManager:
    """High-level manager for ModelNow spend alerts."""

    def __init__(self) -> None:
        self.store = SpendAlertStore()
        self.evaluator = SpendAlertEvaluator(self.store)

    def create_rule(
        self,
        rule_id: str,
        name: str,
        threshold: Decimal,
        *,
        severity: AlertSeverity = AlertSeverity.WARNING,
        currency: str = "USD",
        enabled: bool = True,
    ) -> SpendAlertRule:
        rule = SpendAlertRule(
            rule_id=rule_id,
            name=name,
            threshold=Decimal(threshold),
            severity=severity,
            currency=currency,
            enabled=enabled,
        )

        return self.store.add_rule(rule)

    def get_rule(self, rule_id: str) -> Optional[SpendAlertRule]:
        return self.store.get_rule(rule_id)

    def list_rules(self) -> List[SpendAlertRule]:
        return self.store.list_rules()

    def evaluate(
        self,
        current_spend: Decimal,
        *,
        model: Optional[str] = None,
        provider: Optional[str] = None,
        entity_id: Optional[str] = None,
        currency: str = "USD",
    ) -> List[SpendAlert]:
        return self.evaluator.evaluate(
            current_spend=current_spend,
            model=model,
            provider=provider,
            entity_id=entity_id,
            currency=currency,
        )

    def get_alert(self, alert_id: str) -> Optional[SpendAlert]:
        return self.store.get_alert(alert_id)

    def list_alerts(self) -> List[SpendAlert]:
        return self.store.list_alerts()

    def active_alerts(self) -> List[SpendAlert]:
        return self.store.active_alerts()

    def acknowledge(self, alert_id: str) -> SpendAlert:
        return self.store.acknowledge(alert_id)

    def resolve(self, alert_id: str) -> SpendAlert:
        return self.store.resolve(alert_id)

    def summarize(
        self,
        total_spend: Decimal = Decimal("0"),
        currency: str = "USD",
    ) -> SpendAlertSummary:
        rules = self.store.list_rules()
        alerts = self.store.list_alerts()

        return SpendAlertSummary(
            total_rules=len(rules),
            enabled_rules=sum(1 for rule in rules if rule.enabled),
            total_alerts=len(alerts),
            active_alerts=sum(
                1
                for alert in alerts
                if alert.status == AlertStatus.ACTIVE
            ),
            warning_alerts=sum(
                1
                for alert in alerts
                if alert.severity == AlertSeverity.WARNING
            ),
            critical_alerts=sum(
                1
                for alert in alerts
                if alert.severity == AlertSeverity.CRITICAL
            ),
            total_spend=Decimal(total_spend),
            currency=currency,
        )

    def rule_count(self) -> int:
        return self.store.rule_count()

    def alert_count(self) -> int:
        return self.store.alert_count()

    def clear(self) -> None:
        self.store.clear()


__all__ = ["SpendAlertManager"]
