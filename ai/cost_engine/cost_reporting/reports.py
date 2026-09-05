from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Iterable

from .summary import CostSummary, SummaryBuilder


@dataclass
class CostReport:
    """Generic cost report."""

    report_id: str
    report_type: str

    period_start: datetime | None
    period_end: datetime | None

    summary: CostSummary

    generated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
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
            "summary": self.summary.to_dict(),
            "metadata": self.metadata,
        }


class CostReportGenerator:
    """Generates cost reports."""

    def __init__(
        self,
        summary_builder: SummaryBuilder | None = None,
    ) -> None:

        self.summary_builder = (
            summary_builder or SummaryBuilder()
        )

    def generate(
        self,
        records: Iterable[Any],
        report_id: str,
        report_type: str = "usage",
        period_start: datetime | None = None,
        period_end: datetime | None = None,
        currency: str = "USD",
        metadata: dict[str, Any] | None = None,
    ) -> CostReport:

        summary = self.summary_builder.build(
            records,
            currency=currency,
        )

        return CostReport(
            report_id=report_id,
            report_type=report_type,
            period_start=period_start,
            period_end=period_end,
            summary=summary,
            metadata=metadata or {},
        )

    def daily_report(
        self,
        records: Iterable[Any],
        report_id: str,
        date: datetime,
        currency: str = "USD",
    ) -> CostReport:

        return self.generate(
            records=records,
            report_id=report_id,
            report_type="daily",
            period_start=date,
            period_end=date,
            currency=currency,
        )

    def monthly_report(
        self,
        records: Iterable[Any],
        report_id: str,
        period_start: datetime,
        period_end: datetime,
        currency: str = "USD",
    ) -> CostReport:

        return self.generate(
            records=records,
            report_id=report_id,
            report_type="monthly",
            period_start=period_start,
            period_end=period_end,
            currency=currency,
        )

    def tenant_report(
        self,
        records: Iterable[Any],
        report_id: str,
        tenant_id: str,
        currency: str = "USD",
    ) -> CostReport:

        filtered_records = [
            record
            for record in records
            if self._get(
                record,
                "tenant_id",
            ) == tenant_id
        ]

        return self.generate(
            records=filtered_records,
            report_id=report_id,
            report_type="tenant",
            currency=currency,
            metadata={
                "tenant_id": tenant_id,
            },
        )

    def project_report(
        self,
        records: Iterable[Any],
        report_id: str,
        project_id: str,
        currency: str = "USD",
    ) -> CostReport:

        filtered_records = [
            record
            for record in records
            if self._get(
                record,
                "project_id",
            ) == project_id
        ]

        return self.generate(
            records=filtered_records,
            report_id=report_id,
            report_type="project",
            currency=currency,
            metadata={
                "project_id": project_id,
            },
        )

    @staticmethod
    def _get(
        record: Any,
        name: str,
    ) -> Any:

        if isinstance(record, dict):
            return record.get(name)

        return getattr(
            record,
            name,
            None,
        )