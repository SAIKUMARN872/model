from __future__ import annotations

from datetime import datetime
from typing import Iterable, Optional

from .aggregator import CostAggregator
from .models import (
    CostReport,
    CostReportEntry,
    CostReportSummary,
)


class CostReporter:
    """Generates cost reports from recorded cost entries."""

    def __init__(
        self,
        aggregator: Optional[CostAggregator] = None,
    ) -> None:
        self.aggregator = (
            aggregator or CostAggregator()
        )

    def generate(
        self,
        report_id: str,
        entries: Iterable[CostReportEntry],
        currency: str = "USD",
        metadata: Optional[dict] = None,
    ) -> CostReport:
        """Generate an aggregated cost report."""

        entry_list = [
            entry
            for entry in entries
            if entry.currency.upper()
            == currency.upper()
        ]

        summary = self.aggregator.aggregate(
            entries=entry_list,
            currency=currency,
        )

        return CostReport(
            report_id=report_id,
            total_cost=summary.total_cost,
            currency=summary.currency,
            total_requests=summary.total_requests,
            total_tokens=summary.total_tokens,
            entries=tuple(entry_list),
            metadata=metadata or {},
        )

    def summarize(
        self,
        entries: Iterable[CostReportEntry],
        currency: str = "USD",
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> CostReportSummary:
        """Generate a filtered cost summary."""

        return self.aggregator.aggregate(
            entries=entries,
            currency=currency,
            entity_type=entity_type,
            entity_id=entity_id,
            model=model,
            provider=provider,
        )

    def by_model(
        self,
        entries: Iterable[CostReportEntry],
        currency: str = "USD",
    ) -> dict[str, CostReportSummary]:
        """Generate cost summaries grouped by model."""

        return self.aggregator.by_model(
            entries=entries,
            currency=currency,
        )

    def by_provider(
        self,
        entries: Iterable[CostReportEntry],
        currency: str = "USD",
    ) -> dict[str, CostReportSummary]:
        """Generate cost summaries grouped by provider."""

        return self.aggregator.by_provider(
            entries=entries,
            currency=currency,
        )

    def by_entity(
        self,
        entries: Iterable[CostReportEntry],
        currency: str = "USD",
    ) -> dict[tuple[str, str], CostReportSummary]:
        """Generate cost summaries grouped by entity."""

        return self.aggregator.by_entity(
            entries=entries,
            currency=currency,
        )


__all__ = [
    "CostReporter",
]
