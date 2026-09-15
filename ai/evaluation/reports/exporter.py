"""
Evaluation report exporter.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .report import (
    EvaluationReport,
)
from .dashboard import (
    Dashboard,
)


class ReportExporter:
    """Exports reports and dashboards."""

    def export_json(
        self,
        report: EvaluationReport,
        path: str | Path,
    ) -> Path:

        path = Path(path)

        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with path.open(
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                report.to_dict(),
                file,
                indent=2,
                ensure_ascii=False,
                default=str,
            )

        return path

    def export_text(
        self,
        report: EvaluationReport,
        path: str | Path,
    ) -> Path:

        path = Path(path)

        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        path.write_text(
            report.to_text(),
            encoding="utf-8",
        )

        return path

    def export_dashboard(
        self,
        dashboard: Dashboard,
        path: str | Path,
    ) -> Path:

        path = Path(path)

        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with path.open(
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                dashboard.to_dict(),
                file,
                indent=2,
                ensure_ascii=False,
                default=str,
            )

        return path