"""Export ModelNow evaluation reports to JSON or CSV."""
from __future__ import annotations

import csv
import json
from collections.abc import Mapping
from io import StringIO
from pathlib import Path
from typing import Any


def _validate_report(report: Mapping[str, Any]) -> None:
    if not isinstance(report, Mapping):
        raise ValueError("report must be a mapping")
    if not isinstance(report.get("results", []), list):
        raise ValueError("report results must be a list")


def export_json(
    report: Mapping[str, Any],
    path: str | Path | None = None,
) -> str:
    """Serialize a report as JSON and optionally write it to a file."""
    _validate_report(report)
    content = json.dumps(report, indent=2, ensure_ascii=False, default=str)
    if path is not None:
        destination = Path(path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(content + "\n", encoding="utf-8")
    return content


def export_csv(
    report: Mapping[str, Any],
    path: str | Path | None = None,
) -> str:
    """Export one row per evaluation result, flattening metric columns."""
    _validate_report(report)
    rows = report.get("results", [])
    flattened = []

    for result in rows:
        if not isinstance(result, Mapping):
            raise ValueError("each result must be a mapping")

        row = {
            key: value
            for key, value in result.items()
            if key not in ("metrics", "metadata")
        }

        for section in ("metrics", "metadata"):
            values = result.get(section, {})
            if isinstance(values, Mapping):
                for key, value in values.items():
                    column = f"{section}.{key}"
                    row[column] = (
                        json.dumps(value, ensure_ascii=False, default=str)
                        if isinstance(value, (dict, list, tuple))
                        else value
                    )

        flattened.append(row)

    preferred = ["case_id", "model_name", "quality_score"]
    discovered = sorted({key for row in flattened for key in row})
    fieldnames = [key for key in preferred if key in discovered]
    fieldnames += [key for key in discovered if key not in fieldnames]

    buffer = StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(flattened)
    content = buffer.getvalue()

    if path is not None:
        destination = Path(path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(content, encoding="utf-8")

    return content
