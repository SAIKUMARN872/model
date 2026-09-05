"""
Savings analysis and aggregation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Iterable

from .tracker import SavingsEvent


@dataclass
class SavingsAnalysis:
    """
    Aggregated savings analysis.
    """

    total_original_cost: Decimal = Decimal("0")
    total_optimized_cost: Decimal = Decimal("0")
    total_savings: Decimal = Decimal("0")

    total_events: int = 0

    total_tokens_before: int = 0
    total_tokens_after: int = 0
    total_token_reduction: int = 0

    currency: str = "USD"

    by_optimization_type: dict[
        str,
        Decimal,
    ] = field(default_factory=dict)

    by_model: dict[
        str,
        Decimal,
    ] = field(default_factory=dict)

    by_tenant: dict[
        str,
        Decimal,
    ] = field(default_factory=dict)

    by_project: dict[
        str,
        Decimal,
    ] = field(default_factory=dict)

    @property
    def savings_percent(self) -> Decimal:

        if self.total_original_cost <= 0:
            return Decimal("0")

        return (
            self.total_savings
            / self.total_original_cost
            * Decimal("100")
        )

    @property
    def token_reduction_percent(self) -> Decimal:

        if self.total_tokens_before <= 0:
            return Decimal("0")

        return (
            Decimal(
                self.total_token_reduction
            )
            / Decimal(
                self.total_tokens_before
            )
            * Decimal("100")
        )

    @property
    def average_savings_per_event(
        self,
    ) -> Decimal:

        if self.total_events <= 0:
            return Decimal("0")

        return (
            self.total_savings
            / Decimal(self.total_events)
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "total_original_cost": str(
                self.total_original_cost
            ),
            "total_optimized_cost": str(
                self.total_optimized_cost
            ),
            "total_savings": str(
                self.total_savings
            ),
            "savings_percent": str(
                self.savings_percent
            ),
            "total_events": self.total_events,
            "total_tokens_before": (
                self.total_tokens_before
            ),
            "total_tokens_after": (
                self.total_tokens_after
            ),
            "total_token_reduction": (
                self.total_token_reduction
            ),
            "token_reduction_percent": str(
                self.token_reduction_percent
            ),
            "average_savings_per_event": str(
                self.average_savings_per_event
            ),
            "currency": self.currency,
            "by_optimization_type": {
                key: str(value)
                for key, value
                in self.by_optimization_type.items()
            },
            "by_model": {
                key: str(value)
                for key, value
                in self.by_model.items()
            },
            "by_tenant": {
                key: str(value)
                for key, value
                in self.by_tenant.items()
            },
            "by_project": {
                key: str(value)
                for key, value
                in self.by_project.items()
            },
        }


class SavingsAnalyzer:
    """
    Analyzes savings events.
    """

    def analyze(
        self,
        events: Iterable[SavingsEvent],
        currency: str = "USD",
    ) -> SavingsAnalysis:

        analysis = SavingsAnalysis(
            currency=currency
        )

        for event in events:

            if event.currency != currency:
                continue

            self._add_event(
                analysis,
                event,
            )

        return analysis

    def _add_event(
        self,
        analysis: SavingsAnalysis,
        event: SavingsEvent,
    ) -> None:

        analysis.total_original_cost += (
            event.original_cost
        )

        analysis.total_optimized_cost += (
            event.optimized_cost
        )

        analysis.total_savings += (
            event.savings
        )

        analysis.total_events += 1

        analysis.total_tokens_before += (
            event.tokens_before
        )

        analysis.total_tokens_after += (
            event.tokens_after
        )

        analysis.total_token_reduction += (
            event.token_reduction
        )

        self._add_dimension(
            analysis.by_optimization_type,
            event.optimization_type,
            event.savings,
        )

        if event.optimized_model:

            self._add_dimension(
                analysis.by_model,
                event.optimized_model,
                event.savings,
            )

        if event.tenant_id:

            self._add_dimension(
                analysis.by_tenant,
                event.tenant_id,
                event.savings,
            )

        if event.project_id:

            self._add_dimension(
                analysis.by_project,
                event.project_id,
                event.savings,
            )

    @staticmethod
    def _add_dimension(
        target: dict[str, Decimal],
        key: str,
        amount: Decimal,
    ) -> None:

        target[key] = (
            target.get(
                key,
                Decimal("0"),
            )
            + amount
        )

    def compare(
        self,
        events: Iterable[SavingsEvent],
        currency: str = "USD",
    ) -> dict[str, Decimal]:

        analysis = self.analyze(
            events,
            currency=currency,
        )

        return {
            "original_cost": (
                analysis.total_original_cost
            ),
            "optimized_cost": (
                analysis.total_optimized_cost
            ),
            "savings": (
                analysis.total_savings
            ),
            "savings_percent": (
                analysis.savings_percent
            ),
        }