"""
Savings reporting.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Iterable
from uuid import uuid4

from .analyzer import (
    SavingsAnalysis,
    SavingsAnalyzer,
)
from .tracker import SavingsEvent


@dataclass
class SavingsReport:
    """
    Savings report containing aggregate analysis.
    """

    report_id: str

    report_type: str

    analysis: SavingsAnalysis

    period_start: datetime | None = None
    period_end: datetime | None = None

    generated_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "report_id": self.report_id,
            "report_type": self.report_type,
            "period_start": (
                self.period_start.isoformat()
                if self.period_start
                else None
            ),
            "period_end": (
                self.period_end.isoformat()
                if self.period_end
                else None
            ),
            "generated_at": (
                self.generated_at.isoformat()
            ),
            "analysis": (
                self.analysis.to_dict()
            ),
            "metadata": self.metadata,
        }


class SavingsReportGenerator:
    """
    Generates savings reports from events.
    """

    def __init__(
        self,
        analyzer: SavingsAnalyzer | None = None,
    ) -> None:

        self.analyzer = (
            analyzer or SavingsAnalyzer()
        )

    def generate(
        self,
        events: Iterable[SavingsEvent],
        report_type: str = "savings",
        currency: str = "USD",
        report_id: str | None = None,
        period_start: datetime | None = None,
        period_end: datetime | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> SavingsReport:

        events = list(events)

        analysis = self.analyzer.analyze(
            events,
            currency=currency,
        )

        return SavingsReport(
            report_id=(
                report_id or str(uuid4())
            ),
            report_type=report_type,
            analysis=analysis,
            period_start=period_start,
            period_end=period_end,
            metadata=metadata or {},
        )

    def optimization_report(
        self,
        events: Iterable[SavingsEvent],
        currency: str = "USD",
        report_id: str | None = None,
    ) -> SavingsReport:

        return self.generate(
            events=events,
            report_type="optimization",
            currency=currency,
            report_id=report_id,
        )

    def tenant_report(
        self,
        events: Iterable[SavingsEvent],
        tenant_id: str,
        currency: str = "USD",
        report_id: str | None = None,
    ) -> SavingsReport:

        filtered = [
            event
            for event in events
            if event.tenant_id == tenant_id
        ]

        return self.generate(
            events=filtered,
            report_type="tenant",
            currency=currency,
            report_id=report_id,
            metadata={
                "tenant_id": tenant_id,
            },
        )

    def project_report(
        self,
        events: Iterable[SavingsEvent],
        project_id: str,
        currency: str = "USD",
        report_id: str | None = None,
    ) -> SavingsReport:

        filtered = [
            event
            for event in events
            if event.project_id == project_id
        ]

        return self.generate(
            events=filtered,
            report_type="project",
            currency=currency,
            report_id=report_id,
            metadata={
                "project_id": project_id,
            },
        )