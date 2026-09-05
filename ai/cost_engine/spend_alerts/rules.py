"""
Spend alert rules.

Rules determine when the Cost Engine should generate
a spend, budget, quota, or usage alert.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Any


class AlertRuleError(ValueError):
    """Raised when an alert rule is invalid."""


class AlertMetric(str, Enum):
    """Metrics that can trigger alerts."""

    SPEND = "spend"
    BUDGET_UTILIZATION = "budget_utilization"
    QUOTA_UTILIZATION = "quota_utilization"
    REQUEST_COUNT = "request_count"
    TOKEN_USAGE = "token_usage"
    SAVINGS = "savings"


class AlertOperator(str, Enum):
    """Comparison operators for alert rules."""

    GREATER_THAN = "greater_than"
    GREATER_THAN_OR_EQUAL = "greater_than_or_equal"
    LESS_THAN = "less_than"
    LESS_THAN_OR_EQUAL = "less_than_or_equal"
    EQUAL = "equal"


class AlertSeverity(str, Enum):
    """Alert severity."""

    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass(frozen=True)
class AlertRule:
    """
    Defines a condition that can trigger an alert.

    Example:

        AlertRule(
            name="high-spend",
            metric=AlertMetric.SPEND,
            operator=AlertOperator.GREATER_THAN,
            threshold=Decimal("100"),
            severity=AlertSeverity.WARNING,
        )
    """

    name: str

    metric: AlertMetric
    operator: AlertOperator

    threshold: Decimal

    severity: AlertSeverity = AlertSeverity.WARNING

    currency: str = "USD"

    scope_id: str | None = None

    enabled: bool = True

    cooldown_seconds: int = 0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.name:
            raise AlertRuleError(
                "Rule name cannot be empty"
            )

        if self.threshold < 0:
            raise AlertRuleError(
                "Alert threshold cannot be negative"
            )

        if self.cooldown_seconds < 0:
            raise AlertRuleError(
                "cooldown_seconds cannot be negative"
            )

        if not self.currency:
            raise AlertRuleError(
                "currency cannot be empty"
            )

    def matches(
        self,
        value: Decimal | int | float | str,
    ) -> bool:

        value = Decimal(str(value))

        if self.operator == AlertOperator.GREATER_THAN:
            return value > self.threshold

        if (
            self.operator
            == AlertOperator.GREATER_THAN_OR_EQUAL
        ):
            return value >= self.threshold

        if self.operator == AlertOperator.LESS_THAN:
            return value < self.threshold

        if (
            self.operator
            == AlertOperator.LESS_THAN_OR_EQUAL
        ):
            return value <= self.threshold

        if self.operator == AlertOperator.EQUAL:
            return value == self.threshold

        return False


@dataclass(frozen=True)
class AlertRuleResult:
    """Result of evaluating an alert rule."""

    triggered: bool

    rule: AlertRule

    value: Decimal

    message: str

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class AlertRuleEngine:
    """
    Evaluates alert rules against supplied metric values.
    """

    def __init__(
        self,
        rules: list[AlertRule] | None = None,
    ) -> None:

        self._rules: list[AlertRule] = list(
            rules or []
        )

    def add_rule(
        self,
        rule: AlertRule,
    ) -> AlertRule:

        self._rules.append(rule)

        return rule

    def remove_rule(
        self,
        name: str,
    ) -> bool:

        original_length = len(
            self._rules
        )

        self._rules = [
            rule
            for rule in self._rules
            if rule.name != name
        ]

        return len(self._rules) < original_length

    def get_rule(
        self,
        name: str,
    ) -> AlertRule | None:

        for rule in self._rules:

            if rule.name == name:
                return rule

        return None

    def all_rules(self) -> list[AlertRule]:

        return list(self._rules)

    def enabled_rules(self) -> list[AlertRule]:

        return [
            rule
            for rule in self._rules
            if rule.enabled
        ]

    def evaluate(
        self,
        rule: AlertRule,
        value: Decimal | int | float | str,
    ) -> AlertRuleResult:

        value = Decimal(str(value))

        triggered = rule.matches(
            value
        )

        if triggered:
            message = (
                f"Alert rule '{rule.name}' triggered: "
                f"{rule.metric.value}={value} "
                f"{rule.operator.value} "
                f"{rule.threshold}"
            )
        else:
            message = (
                f"Alert rule '{rule.name}' not triggered: "
                f"{rule.metric.value}={value}"
            )

        return AlertRuleResult(
            triggered=triggered,
            rule=rule,
            value=value,
            message=message,
        )

    def evaluate_metric(
        self,
        metric: AlertMetric,
        value: Decimal | int | float | str,
        scope_id: str | None = None,
    ) -> list[AlertRuleResult]:

        results: list[AlertRuleResult] = []

        for rule in self.enabled_rules():

            if rule.metric != metric:
                continue

            if (
                rule.scope_id is not None
                and rule.scope_id != scope_id
            ):
                continue

            results.append(
                self.evaluate(
                    rule,
                    value,
                )
            )

        return results

    def triggered(
        self,
        metric: AlertMetric,
        value: Decimal | int | float | str,
        scope_id: str | None = None,
    ) -> list[AlertRuleResult]:

        return [
            result
            for result in self.evaluate_metric(
                metric=metric,
                value=value,
                scope_id=scope_id,
            )
            if result.triggered
        ]