from __future__ import annotations

from decimal import Decimal

from .models import SavingsRecord


class SavingsCalculator:
    """Calculates savings produced by an optimized model route."""

    def calculate(
        self,
        baseline_cost: Decimal,
        optimized_cost: Decimal,
        *,
        savings_id: str,
        currency: str = "USD",
        model: str | None = None,
        optimized_model: str | None = None,
        provider: str | None = None,
        request_id: str | None = None,
    ) -> SavingsRecord:
        baseline_cost = Decimal(baseline_cost)
        optimized_cost = Decimal(optimized_cost)

        if baseline_cost < Decimal("0"):
            raise ValueError("baseline_cost must not be negative")

        if optimized_cost < Decimal("0"):
            raise ValueError("optimized_cost must not be negative")

        savings_amount = max(
            baseline_cost - optimized_cost,
            Decimal("0"),
        )

        savings_percentage = (
            (savings_amount / baseline_cost) * Decimal("100")
            if baseline_cost > Decimal("0")
            else Decimal("0")
        )

        return SavingsRecord(
            savings_id=savings_id,
            baseline_cost=baseline_cost,
            optimized_cost=optimized_cost,
            savings_amount=savings_amount,
            savings_percentage=savings_percentage,
            currency=currency,
            model=model,
            optimized_model=optimized_model,
            provider=provider,
            request_id=request_id,
        )

    def calculate_from_costs(
        self,
        baseline_cost: Decimal,
        optimized_cost: Decimal,
    ) -> tuple[Decimal, Decimal]:
        baseline_cost = Decimal(baseline_cost)
        optimized_cost = Decimal(optimized_cost)

        if baseline_cost < Decimal("0"):
            raise ValueError("baseline_cost must not be negative")

        if optimized_cost < Decimal("0"):
            raise ValueError("optimized_cost must not be negative")

        savings_amount = max(
            baseline_cost - optimized_cost,
            Decimal("0"),
        )

        savings_percentage = (
            (savings_amount / baseline_cost) * Decimal("100")
            if baseline_cost > Decimal("0")
            else Decimal("0")
        )

        return savings_amount, savings_percentage


__all__ = ["SavingsCalculator"]
