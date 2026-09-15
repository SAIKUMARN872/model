"""
Evaluation report generation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:

    return datetime.now(
        timezone.utc
    )


@dataclass
class EvaluationReport:
    """Represents a complete evaluation report."""

    title: str

    summary: dict[str, Any] = field(
        default_factory=dict
    )

    metrics: dict[str, Any] = field(
        default_factory=dict
    )

    results: list[dict[str, Any]] = field(
        default_factory=list
    )

    recommendations: list[str] = field(
        default_factory=list
    )

    created_at: datetime = field(
        default_factory=utc_now
    )

    def add_result(
        self,
        result: dict[str, Any],
    ) -> None:

        self.results.append(
            result
        )

    def add_recommendation(
        self,
        recommendation: str,
    ) -> None:

        recommendation = (
            recommendation.strip()
        )

        if recommendation:
            self.recommendations.append(
                recommendation
            )

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "title": self.title,
            "summary": self.summary,
            "metrics": self.metrics,
            "results": self.results,
            "recommendations":
                self.recommendations,
            "created_at":
                self.created_at.isoformat(),
        }

    def to_text(
        self,
    ) -> str:

        lines = [
            f"# {self.title}",
            "",
            "## Summary",
        ]

        for key, value in self.summary.items():

            lines.append(
                f"- {key}: {value}"
            )

        lines.extend(
            [
                "",
                "## Metrics",
            ]
        )

        for key, value in self.metrics.items():

            lines.append(
                f"- {key}: {value}"
            )

        if self.recommendations:

            lines.extend(
                [
                    "",
                    "## Recommendations",
                ]
            )

            for recommendation in (
                self.recommendations
            ):

                lines.append(
                    f"- {recommendation}"
                )

        return "\n".join(
            lines
        )