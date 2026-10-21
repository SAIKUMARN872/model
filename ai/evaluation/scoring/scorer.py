"""Weighted evaluation scoring for ModelNow."""
from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any

from ai.evaluation.scoring.weights import validate_weights


def score_model(
    metrics: Mapping[str, float | int | None],
    weights: Mapping[str, float] | None = None,
) -> dict[str, Any]:
    """Score normalized metrics and report metric coverage.

    Every supplied metric must be a finite number between 0 and 1.
    Missing metrics are excluded, and the remaining weights are renormalized.
    """
    if not isinstance(metrics, Mapping):
        raise ValueError("metrics must be a mapping")

    chosen_weights = validate_weights(weights)
    used = {}

    for name, value in metrics.items():
        if name not in chosen_weights or value is None:
            continue
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"metric {name!r} must be a finite number or None")
        if not math.isfinite(value) or not 0 <= value <= 1:
            raise ValueError(f"metric {name!r} must be between 0 and 1")
        used[name] = float(value)

    if not used:
        raise ValueError("at least one configured scoring metric is required")

    available_weight = sum(chosen_weights[name] for name in used)
    score = sum(
        used[name] * chosen_weights[name] for name in used
    ) / available_weight

    return {
        "score": round(score, 6),
        "metrics_used": used,
        "weights_used": {
            name: round(chosen_weights[name] / available_weight, 6)
            for name in used
        },
        "metric_coverage": round(len(used) / len(chosen_weights), 6),
    }


def score_models(
    metrics_by_model: Mapping[str, Mapping[str, float | int | None]],
    weights: Mapping[str, float] | None = None,
) -> list[dict[str, Any]]:
    """Score multiple models and order them by score, highest first."""
    if not isinstance(metrics_by_model, Mapping) or not metrics_by_model:
        raise ValueError("metrics_by_model must be a non-empty mapping")

    results = []
    for model_name, metrics in metrics_by_model.items():
        if not isinstance(model_name, str) or not model_name.strip():
            raise ValueError("model names must be non-empty strings")
        result = score_model(metrics, weights)
        result["model_name"] = model_name
        results.append(result)

    results.sort(key=lambda item: (-item["score"], item["model_name"]))
    for position, result in enumerate(results, start=1):
        result["rank"] = position

    return results
