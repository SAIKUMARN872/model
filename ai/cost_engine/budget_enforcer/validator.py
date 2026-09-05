from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .limits import BudgetLimit, SpendSnapshot


class BudgetValidationError(Exception):
    pass


@dataclass(frozen=True)
class BudgetValidationResult:
    allowed: bool
    soft_limit_reached: bool
    hard_limit_reached: bool
    daily_remaining: Decimal
    monthly_remaining: Decimal
    reason: str = ""


class BudgetValidator:
    """
    Pure validation logic.

    No side effects happen here.
    """

    def validate(
        self,
        limit: BudgetLimit,
        spend: SpendSnapshot,
        estimated_cost: Decimal,
        estimated_tokens: int,
    ) -> BudgetValidationResult:

        if estimated_cost < 0:
            raise BudgetValidationError(
                "estimated_cost cannot be negative"
            )

        if estimated_tokens < 0:
            raise BudgetValidationError(
                "estimated_tokens cannot be negative"
            )

        if (
            limit.max_request_cost > 0
            and estimated_cost > limit.max_request_cost
        ):
            return BudgetValidationResult(
                allowed=False,
                soft_limit_reached=False,
                hard_limit_reached=True,
                daily_remaining=Decimal("0"),
                monthly_remaining=Decimal("0"),
                reason="request_cost_exceeds_maximum",
            )

        if (
            limit.max_tokens_per_request > 0
            and estimated_tokens > limit.max_tokens_per_request
        ):
            return BudgetValidationResult(
                allowed=False,
                soft_limit_reached=False,
                hard_limit_reached=True,
                daily_remaining=Decimal("0"),
                monthly_remaining=Decimal("0"),
                reason="request_tokens_exceed_maximum",
            )

        projected_daily = (
            spend.daily_spend
            + spend.reserved_spend
            + estimated_cost
        )

        projected_monthly = (
            spend.monthly_spend
            + spend.reserved_spend
            + estimated_cost
        )

        daily_remaining = max(
            Decimal("0"),
            limit.daily_limit - projected_daily,
        )

        monthly_remaining = max(
            Decimal("0"),
            limit.monthly_limit - projected_monthly,
        )

        daily_hard = (
            limit.daily_limit > 0
            and projected_daily
            >= limit.daily_limit
            * limit.hard_limit_percent
            / Decimal("100")
        )

        monthly_hard = (
            limit.monthly_limit > 0
            and projected_monthly
            >= limit.monthly_limit
            * limit.hard_limit_percent
            / Decimal("100")
        )

        daily_soft = (
            limit.daily_limit > 0
            and projected_daily
            >= limit.daily_limit
            * limit.soft_limit_percent
            / Decimal("100")
        )

        monthly_soft = (
            limit.monthly_limit > 0
            and projected_monthly
            >= limit.monthly_limit
            * limit.soft_limit_percent
            / Decimal("100")
        )

        hard = daily_hard or monthly_hard
        soft = daily_soft or monthly_soft

        return BudgetValidationResult(
            allowed=not hard,
            soft_limit_reached=soft,
            hard_limit_reached=hard,
            daily_remaining=daily_remaining,
            monthly_remaining=monthly_remaining,
            reason=(
                "hard_limit_reached"
                if hard
                else "soft_limit_reached"
                if soft
                else "within_budget"
            ),
        )