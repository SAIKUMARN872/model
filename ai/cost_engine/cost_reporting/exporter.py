from __future__ import annotations

from dataclasses import asdict
from decimal import Decimal
from typing import Any

from .models import (
    CostReport,
    CostReportEntry,
    CostReportSummary,
)


def _serialize_decimal(value: Decimal) -> str:
    """Serialize Decimal without losing monetary precision."""

    return str(value)


class CostReportExporter:
    """Exports cost reports into API-friendly structures."""

    def entry_to_dict(
        self,
        entry: CostReportEntry,
    ) -> dict[str, Any]:
        """Convert a report entry to a dictionary."""

        data = asdict(entry)

        data["amount"] = _serialize_decimal(
            entry.amount
        )
        data["timestamp"] = entry.timestamp.isoformat()

        return data

    def summary_to_dict(
        self,
        summary: CostReportSummary,
    ) -> dict[str, Any]:
        """Convert a report summary to a dictionary."""

        return {
            "total_cost": _serialize_decimal(
                summary.total_cost
            ),
            "currency": summary.currency,
            "total_requests": summary.total_requests,
            "total_tokens": summary.total_tokens,
            "average_cost_per_request": (
                _serialize_decimal(
                    summary.average_cost_per_request
                )
            ),
            "average_cost_per_1k_tokens": (
                _serialize_decimal(
                    summary.average_cost_per_1k_tokens
                )
            ),
        }

    def report_to_dict(
        self,
        report: CostReport,
    ) -> dict[str, Any]:
        """Convert a complete report to a dictionary."""

        return {
            "report_id": report.report_id,
            "total_cost": _serialize_decimal(
                report.total_cost
            ),
            "currency": report.currency,
            "total_requests": report.total_requests,
            "total_tokens": report.total_tokens,
            "entries": [
                self.entry_to_dict(entry)
                for entry in report.entries
            ],
            "generated_at": (
                report.generated_at.isoformat()
            ),
            "metadata": report.metadata,
        }


__all__ = [
    "CostReportExporter",
]
