from __future__ import annotations

import csv
import io
import json
from typing import Iterable

from .reports import CostReport


class ReportExporter:
    """Exports cost reports."""

    def to_dict(
        self,
        report: CostReport,
    ) -> dict:

        return report.to_dict()

    def to_json(
        self,
        report: CostReport,
    ) -> str:

        return json.dumps(
            report.to_dict(),
            indent=2,
            default=str,
        )

    def to_csv(
        self,
        report: CostReport,
    ) -> str:

        output = io.StringIO()

        writer = csv.writer(output)

        writer.writerow([
            "metric",
            "value",
            "currency",
        ])

        summary = report.summary

        rows = [
            (
                "total_cost",
                summary.total_cost,
                summary.currency,
            ),
            (
                "total_requests",
                summary.total_requests,
                summary.currency,
            ),
            (
                "total_tokens",
                summary.total_tokens,
                summary.currency,
            ),
            (
                "input_tokens",
                summary.input_tokens,
                summary.currency,
            ),
            (
                "output_tokens",
                summary.output_tokens,
                summary.currency,
            ),
            (
                "input_cost",
                summary.input_cost,
                summary.currency,
            ),
            (
                "output_cost",
                summary.output_cost,
                summary.currency,
            ),
            (
                "average_cost_per_request",
                summary.average_cost_per_request,
                summary.currency,
            ),
            (
                "cost_per_1k_tokens",
                summary.cost_per_1k_tokens,
                summary.currency,
            ),
        ]

        for metric, value, currency in rows:
            writer.writerow([
                metric,
                str(value),
                currency,
            ])

        return output.getvalue()

    def records_to_csv(
        self,
        records: Iterable[dict],
    ) -> str:

        records = list(records)

        if not records:
            return ""

        output = io.StringIO()

        keys = sorted(
            {
                key
                for record in records
                for key in record.keys()
            }
        )

        writer = csv.DictWriter(
            output,
            fieldnames=keys,
        )

        writer.writeheader()

        for record in records:
            writer.writerow(record)

        return output.getvalue()