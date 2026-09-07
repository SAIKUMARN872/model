from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from .summary import CostSummary


@dataclass(frozen=True)
class ChartData:
    """Generic chart data."""

    chart_type: str
    title: str
    labels: list[str]
    values: list[Decimal]
    currency: str = "USD"

    def to_dict(self) -> dict[str, Any]:
        return {
            "chart_type": self.chart_type,
            "title": self.title,
            "labels": self.labels,
            "values": [
                str(value)
                for value in self.values
            ],
            "currency": self.currency,
        }


class CostChartBuilder:
    """Builds chart-ready datasets."""

    def by_model(
        self,
        summary: CostSummary,
    ) -> ChartData:

        return self._from_mapping(
            title="Cost by Model",
            chart_type="bar",
            data=summary.by_model,
            currency=summary.currency,
        )

    def by_provider(
        self,
        summary: CostSummary,
    ) -> ChartData:

        return self._from_mapping(
            title="Cost by Provider",
            chart_type="bar",
            data=summary.by_provider,
            currency=summary.currency,
        )

    def by_tenant(
        self,
        summary: CostSummary,
    ) -> ChartData:

        return self._from_mapping(
            title="Cost by Tenant",
            chart_type="bar",
            data=summary.by_tenant,
            currency=summary.currency,
        )

    def by_project(
        self,
        summary: CostSummary,
    ) -> ChartData:

        return self._from_mapping(
            title="Cost by Project",
            chart_type="bar",
            data=summary.by_project,
            currency=summary.currency,
        )

    def by_user(
        self,
        summary: CostSummary,
    ) -> ChartData:

        return self._from_mapping(
            title="Cost by User",
            chart_type="bar",
            data=summary.by_user,
            currency=summary.currency,
        )

    def cost_distribution(
        self,
        summary: CostSummary,
    ) -> ChartData:

        return ChartData(
            chart_type="pie",
            title="Input vs Output Cost",
            labels=[
                "Input Cost",
                "Output Cost",
            ],
            values=[
                summary.input_cost,
                summary.output_cost,
            ],
            currency=summary.currency,
        )

    def _from_mapping(
        self,
        title: str,
        chart_type: str,
        data: dict[str, Decimal],
        currency: str,
    ) -> ChartData:

        sorted_items = sorted(
            data.items(),
            key=lambda item: item[1],
            reverse=True,
        )

        return ChartData(
            chart_type=chart_type,
            title=title,
            labels=[
                item[0]
                for item in sorted_items
            ],
            values=[
                item[1]
                for item in sorted_items
            ],
            currency=currency,
        )