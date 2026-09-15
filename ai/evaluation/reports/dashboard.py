"""
Evaluation dashboard data preparation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .report import (
    EvaluationReport,
)


@dataclass
class Dashboard:
    """Dashboard representation."""

    title: str = "AI Evaluation Dashboard"

    cards: dict[str, Any] = field(
        default_factory=dict
    )

    charts: dict[str, list[Any]] = field(
        default_factory=dict
    )

    alerts: list[str] = field(
        default_factory=list
    )

    def add_card(
        self,
        name: str,
        value: Any,
    ) -> None:

        self.cards[name] = value

    def add_chart(
        self,
        name: str,
        values: list[Any],
    ) -> None:

        self.charts[name] = list(
            values
        )

    def add_alert(
        self,
        message: str,
    ) -> None:

        if message.strip():

            self.alerts.append(
                message.strip()
            )

    def from_report(
        self,
        report: EvaluationReport,
    ) -> "Dashboard":

        dashboard = Dashboard(
            title=report.title
        )

        for key, value in (
            report.summary.items()
        ):

            dashboard.add_card(
                key,
                value,
            )

        for key, value in (
            report.metrics.items()
        ):

            if isinstance(
                value,
                list,
            ):

                dashboard.add_chart(
                    key,
                    value,
                )

            else:

                dashboard.add_card(
                    key,
                    value,
                )

        return dashboard

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "title": self.title,
            "cards": self.cards,
            "charts": self.charts,
            "alerts": self.alerts,
        }