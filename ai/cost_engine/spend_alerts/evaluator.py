from __future__ import annotations

from decimal import Decimal
from uuid import uuid4
from typing import List, Optional

from .alerts import SpendAlertStore
from .models import (
    AlertSeverity,
    SpendAlert,
    SpendAlertRule,
)


class SpendAlertEvaluator:
    """Evaluates spend against configured alert rules."""

    def __init__(self, store: SpendAlertStore) -> None:
        self.store = store

    def evaluate(
        self,
        current_spend: Decimal,
        *,
        model: Optional[str] = None,
        provider: Optional[str] = None,
        entity_id: Optional[str] = None,
        currency: str = "USD",
    ) -> List[SpendAlert]:
        current_spend = Decimal(current_spend)

        if current_spend < Decimal("0"):
            raise ValueError("current_spend must not be negative")

        triggered: List[SpendAlert] = []

        for rule in self.store.enabled_rules():
            if rule.currency != currency:
                continue

            if current_spend < rule.threshold:
                continue

            alert = self._create_alert(
                rule=rule,
                current_spend=current_spend,
                model=model,
                provider=provider,
                entity_id=entity_id,
            )

            self.store.add_alert(alert)
            triggered.append(alert)

        return triggered

    def evaluate_rule(
        self,
        rule_id: str,
        current_spend: Decimal,
        *,
        model: Optional[str] = None,
        provider: Optional[str] = None,
        entity_id: Optional[str] = None,
    ) -> Optional[SpendAlert]:
        rule = self.store.require_rule(rule_id)
        current_spend = Decimal(current_spend)

        if current_spend < Decimal("0"):
            raise ValueError("current_spend must not be negative")

        if not rule.enabled:
            return None

        if current_spend < rule.threshold:
            return None

        alert = self._create_alert(
            rule=rule,
            current_spend=current_spend,
            model=model,
            provider=provider,
            entity_id=entity_id,
        )

        self.store.add_alert(alert)
        return alert

    def is_triggered(
        self,
        current_spend: Decimal,
        threshold: Decimal,
    ) -> bool:
        return Decimal(current_spend) >= Decimal(threshold)

    def _create_alert(
        self,
        rule: SpendAlertRule,
        current_spend: Decimal,
        *,
        model: Optional[str],
        provider: Optional[str],
        entity_id: Optional[str],
    ) -> SpendAlert:
        message = (
            f"Spend threshold exceeded for rule '{rule.name}': "
            f"{current_spend} {rule.currency} >= "
            f"{rule.threshold} {rule.currency}"
        )

        return SpendAlert(
            alert_id=f"alert-{uuid4().hex}",
            rule_id=rule.rule_id,
            current_spend=current_spend,
            threshold=rule.threshold,
            severity=rule.severity,
            currency=rule.currency,
            model=model,
            provider=provider,
            entity_id=entity_id,
            message=message,
        )


__all__ = ["SpendAlertEvaluator"]
