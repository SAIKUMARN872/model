"""Prepare evaluation report data for dashboard displays."""
from __future__ import annotations

from collections import defaultdict
from collections.abc import Mapping
from typing import Any


def build_dashboard_data(report: Mapping[str, Any]) -> dict[str, Any]:
    """Build per-model metrics and summary cards from a structured report."""
    if not isinstance(report, Mapping):
        raise ValueError("report must be a mapping")

    results = report.get("results", [])
    if not isinstance(results, list):
        raise ValueError("report results must be a list")

    by_model: dict[str, list[Mapping[str, Any]]] = defaultdict(list)
    for item in results:
        if not isinstance(item, Mapping):
            raise ValueError("each result must be a mapping")
        model = item.get("model_name")
        if model is not None:
            by_model[str(model)].append(item)

    model_rows = []
    for model_name, items in sorted(by_model.items()):
        scores = [
            float(item["quality_score"])
            for item in items
            if isinstance(item.get("quality_score"), (int, float))
            and not isinstance(item.get("quality_score"), bool)
        ]

        latencies = []
        costs = []
        for item in items:
            metrics = item.get("metrics", {})
            if not isinstance(metrics, Mapping):
                metrics = {}

            latency = item.get("latency_ms", metrics.get("latency_ms"))
            cost = item.get("cost_usd", metrics.get("cost_usd"))

            if isinstance(latency, (int, float)) and not isinstance(latency, bool):
                latencies.append(float(latency))
            if isinstance(cost, (int, float)) and not isinstance(cost, bool):
                costs.append(float(cost))

        model_rows.append({
            "model_name": model_name,
            "case_count": len(items),
            "mean_quality_score": round(sum(scores) / len(scores), 6)
            if scores else None,
            "mean_latency_ms": round(sum(latencies) / len(latencies), 4)
            if latencies else None,
            "total_cost_usd": round(sum(costs), 8) if costs else None,
        })

    return {
        "title": report.get("title", "ModelNow Evaluation Dashboard"),
        "status": report.get("status", "unknown"),
        "cards": {
            "case_count": report.get("case_count", len(results)),
            "model_count": len(by_model),
            "mean_quality_score": report.get("mean_quality_score"),
        },
        "models": model_rows,
        "limitations": [
            "Unavailable metrics are reported as null rather than treated as zero.",
            "Quality scores should only be compared under consistent evaluation conditions.",
        ],
    }
