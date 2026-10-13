"""Build structured reports from ModelNow evaluation results."""
from __future__ import annotations

from dataclasses import asdict, is_dataclass
from datetime import datetime, timezone
from typing import Any, Iterable, Mapping


def _to_dict(value: Any) -> dict[str, Any]:
    """Convert a mapping or dataclass-like evaluation object to a dictionary."""
    if isinstance(value, Mapping):
        return dict(value)
    if is_dataclass(value) and not isinstance(value, type):
        return asdict(value)
    if hasattr(value, "__dict__"):
        return {
            key: item
            for key, item in vars(value).items()
            if not key.startswith("_")
        }
    raise ValueError("Each report item must be a mapping or data object")


def _json_safe(value: Any) -> Any:
    """Convert nested values into JSON-friendly built-in types."""
    if isinstance(value, Mapping):
        return {str(key): _json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]
    if hasattr(value, "item") and callable(value.item):
        try:
            return _json_safe(value.item())
        except (ValueError, TypeError):
            pass
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def create_evaluation_report(
    results: Iterable[Any],
    summaries: Iterable[Any] | None = None,
    title: str = "ModelNow Evaluation Report",
    metadata: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Create a structured report from evaluation results and optional summaries."""
    if isinstance(results, (str, bytes, Mapping)):
        raise ValueError("results must be an iterable of evaluation result objects")
    if not isinstance(title, str) or not title.strip():
        raise ValueError("title must be a non-empty string")
    if metadata is not None and not isinstance(metadata, Mapping):
        raise ValueError("metadata must be a mapping")

    result_items = [_json_safe(_to_dict(item)) for item in results]

    summary_items = []
    if summaries is not None:
        if isinstance(summaries, (str, bytes, Mapping)):
            raise ValueError("summaries must be an iterable of summary objects")
        summary_items = [_json_safe(_to_dict(item)) for item in summaries]

    model_names = sorted({
        str(item["model_name"])
        for item in result_items
        if item.get("model_name") is not None
    })

    scores = []
    for item in result_items:
        score = item.get("quality_score")
        if isinstance(score, (int, float)) and not isinstance(score, bool):
            scores.append(float(score))

    return {
        "schema_version": "1.0",
        "title": title.strip(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "completed",
        "case_count": len(result_items),
        "model_count": len(model_names),
        "models": model_names,
        "mean_quality_score": round(sum(scores) / len(scores), 6)
        if scores else None,
        "results": result_items,
        "summaries": summary_items,
        "metadata": _json_safe(dict(metadata or {})),
        "limitations": [
            "Quality scores depend on the metrics and evaluators supplied.",
            "Lexical similarity and heuristic scores do not prove factual correctness.",
            "Model comparisons are meaningful only when evaluation conditions are comparable.",
        ],
    }


def summarize_evaluation_report(report: Mapping[str, Any]) -> dict[str, Any]:
    """Return a compact overview suitable for logs or API responses."""
    if not isinstance(report, Mapping):
        raise ValueError("report must be a mapping")

    results = report.get("results", [])
    if not isinstance(results, list):
        raise ValueError("report results must be a list")

    return {
        "title": report.get("title", "ModelNow Evaluation Report"),
        "status": report.get("status", "unknown"),
        "case_count": report.get("case_count", len(results)),
        "model_count": report.get("model_count", 0),
        "models": list(report.get("models", [])),
        "mean_quality_score": report.get("mean_quality_score"),
        "generated_at": report.get("generated_at"),
    }
