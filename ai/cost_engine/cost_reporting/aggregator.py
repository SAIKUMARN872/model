from __future__ import annotations

from collections import defaultdict
from decimal import Decimal
from typing import Iterable, Optional

from .models import (
    CostReportEntry,
    CostReportSummary,
)


class CostAggregator:
    """Aggregates cost records for reporting and optimization."""

    def aggregate(
        self,
        entries: Iterable[CostReportEntry],
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
        currency: str = "USD",
    ) -> CostReportSummary:
        """Aggregate matching cost records."""

        filtered: list[CostReportEntry] = []

        for entry in entries:
            if entry.currency.upper() != currency.upper():
                continue

            if (
                entity_type is not None
                and entry.entity_type
                != entity_type.strip().lower()
            ):
                continue

            if (
                entity_id is not None
                and entry.entity_id != entity_id
            ):
                continue

            if (
                model is not None
                and entry.model != model
            ):
                continue

            if (
                provider is not None
                and entry.provider != provider
            ):
                continue

            filtered.append(entry)

        total_cost = sum(
            (entry.amount for entry in filtered),
            Decimal("0"),
        )

        total_requests = sum(
            entry.request_count
            for entry in filtered
        )

        total_tokens = sum(
            entry.token_count
            for entry in filtered
        )

        if total_requests > 0:
            average_cost_per_request = (
                total_cost
                / Decimal(total_requests)
            )
        else:
            average_cost_per_request = Decimal("0")

        if total_tokens > 0:
            average_cost_per_1k_tokens = (
                total_cost
                / Decimal(total_tokens)
                * Decimal("1000")
            )
        else:
            average_cost_per_1k_tokens = Decimal("0")

        return CostReportSummary(
            total_cost=total_cost,
            currency=currency.upper(),
            total_requests=total_requests,
            total_tokens=total_tokens,
            average_cost_per_request=(
                average_cost_per_request
            ),
            average_cost_per_1k_tokens=(
                average_cost_per_1k_tokens
            ),
        )

    def by_model(
        self,
        entries: Iterable[CostReportEntry],
        currency: str = "USD",
    ) -> dict[str, CostReportSummary]:
        """Aggregate costs by model."""

        groups: dict[str, list[CostReportEntry]] = (
            defaultdict(list)
        )

        for entry in entries:
            if entry.currency.upper() != currency.upper():
                continue

            key = entry.model or "unknown"
            groups[key].append(entry)

        return {
            model: self.aggregate(
                model=model,
                entries=model_entries,
                currency=currency,
            )
            for model, model_entries in groups.items()
        }

    def by_provider(
        self,
        entries: Iterable[CostReportEntry],
        currency: str = "USD",
    ) -> dict[str, CostReportSummary]:
        """Aggregate costs by provider."""

        groups: dict[str, list[CostReportEntry]] = (
            defaultdict(list)
        )

        for entry in entries:
            if entry.currency.upper() != currency.upper():
                continue

            key = entry.provider or "unknown"
            groups[key].append(entry)

        return {
            provider: self.aggregate(
                provider=provider,
                entries=provider_entries,
                currency=currency,
            )
            for provider, provider_entries
            in groups.items()
        }

    def by_entity(
        self,
        entries: Iterable[CostReportEntry],
        currency: str = "USD",
    ) -> dict[tuple[str, str], CostReportSummary]:
        """Aggregate costs by enterprise entity."""

        groups: dict[
            tuple[str, str],
            list[CostReportEntry],
        ] = defaultdict(list)

        for entry in entries:
            if entry.currency.upper() != currency.upper():
                continue

            key = (
                entry.entity_type,
                entry.entity_id,
            )

            groups[key].append(entry)

        return {
            entity: self.aggregate(
                entity_type=entity[0],
                entity_id=entity[1],
                entries=entity_entries,
                currency=currency,
            )
            for entity, entity_entries
            in groups.items()
        }


__all__ = [
    "CostAggregator",
]
