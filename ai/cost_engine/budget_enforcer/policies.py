from __future__ import annotations

from decimal import Decimal

from .models import EnforcementAction


DEFAULT_WARNING_THRESHOLD = Decimal("0.80")
DEFAULT_CRITICAL_THRESHOLD = Decimal("0.95")


class BudgetPolicy:
    """Determines whether a request should be allowed, warned, or blocked."""

    def __init__(
        self,
        warning_threshold: Decimal = DEFAULT_WARNING_THRESHOLD,
        critical_threshold: Decimal = DEFAULT_CRITICAL_THRESHOLD,
    ) -> None:
        self.warning_threshold = Decimal(str(warning_threshold))
        self.critical_threshold = Decimal(str(critical_threshold))

        if not (
            Decimal("0")
            < self.warning_threshold
            < self.critical_threshold
            <= Decimal("1")
        ):
            raise ValueError(
                "Thresholds must satisfy "
                "0 < warning < critical <= 1"
            )

    def evaluate(
        self,
        limit: Decimal,
        spent: Decimal,
        requested_cost: Decimal,
    ) -> EnforcementAction:
        limit = Decimal(str(limit))
        spent = Decimal(str(spent))
        requested_cost = Decimal(str(requested_cost))

        if limit <= Decimal("0"):
            raise ValueError(
                "Budget limit must be greater than zero"
            )

        if spent < Decimal("0"):
            raise ValueError(
                "Spent amount cannot be negative"
            )

        if requested_cost < Decimal("0"):
            raise ValueError(
                "Requested cost cannot be negative"
            )

        projected_spend = spent + requested_cost
        projected_utilization = projected_spend / limit

        if projected_utilization > Decimal("1"):
            return EnforcementAction.BLOCK

        if projected_utilization >= self.critical_threshold:
            return EnforcementAction.WARN

        if projected_utilization >= self.warning_threshold:
            return EnforcementAction.WARN

        return EnforcementAction.ALLOW

    def is_warning(
        self,
        action: EnforcementAction,
    ) -> bool:
        return action == EnforcementAction.WARN

    def is_blocked(
        self,
        action: EnforcementAction,
    ) -> bool:
        return action == EnforcementAction.BLOCK


__all__ = [
    "BudgetPolicy",
    "DEFAULT_WARNING_THRESHOLD",
    "DEFAULT_CRITICAL_THRESHOLD",
]
