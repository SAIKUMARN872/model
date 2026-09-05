from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .charts import (
    ChartData,
    CostChartBuilder,
)
from .reports import CostReport


@dataclass
class Dashboard:
    """Cost reporting dashboard."""

    dashboard_id: str
    report: CostReport

    charts: list[ChartData] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "dashboard_id": self.dashboard_id,
            "report": self.report.to_dict(),
            "charts": [
                chart.to_dict()
                for chart in self.charts
            ],
            "metadata": self.metadata,
        }


class DashboardBuilder:
    """Creates cost dashboards."""

    def __init__(
        self,
        chart_builder: CostChartBuilder | None = None,
    ) -> None:

        self.chart_builder = (
            chart_builder or CostChartBuilder()
        )

    def build(
        self,
        dashboard_id: str,
        report: CostReport,
        include_model_chart: bool = True,
        include_provider_chart: bool = True,
        include_tenant_chart: bool = True,
        include_project_chart: bool = True,
        include_user_chart: bool = False,
        include_distribution_chart: bool = True,
    ) -> Dashboard:

        summary = report.summary

        charts: list[ChartData] = []

        if include_model_chart:
            charts.append(
                self.chart_builder.by_model(
                    summary
                )
            )

        if include_provider_chart:
            charts.append(
                self.chart_builder.by_provider(
                    summary
                )
            )

        if include_tenant_chart:
            charts.append(
                self.chart_builder.by_tenant(
                    summary
                )
            )

        if include_project_chart:
            charts.append(
                self.chart_builder.by_project(
                    summary
                )
            )

        if include_user_chart:
            charts.append(
                self.chart_builder.by_user(
                    summary
                )
            )

        if include_distribution_chart:
            charts.append(
                self.chart_builder.cost_distribution(
                    summary
                )
            )

        return Dashboard(
            dashboard_id=dashboard_id,
            report=report,
            charts=charts,
            metadata={
                "report_type": report.report_type,
            },
        )