"""Configurable, normalized model ranking."""
import math


DEFAULT_WEIGHTS = {
    "quality": 0.50,
    "latency": 0.25,
    "cost": 0.25,
}

METRIC_ALIASES = {
    "quality": ("quality_score", "exact_match_rate", "mean_token_f1", "token_f1"),
    "latency": ("mean_latency_ms", "latency_ms", "p95_latency_ms"),
    "cost": ("mean_cost_usd", "cost_usd", "total_cost_usd"),
    "reliability": ("success_rate",),
}


def _validate_weights(weights):
    chosen = DEFAULT_WEIGHTS.copy() if weights is None else weights
    if not isinstance(chosen, dict) or not chosen:
        raise ValueError("weights must be a non-empty dictionary")
    for key, value in chosen.items():
        if key not in METRIC_ALIASES:
            raise ValueError(f"unsupported ranking metric: {key!r}")
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"weight for {key!r} must be a finite positive number")
        if not math.isfinite(value) or value <= 0:
            raise ValueError(f"weight for {key!r} must be a finite positive number")
    return {key: float(value) for key, value in chosen.items()}


def _extract_metric(metrics, category):
    for key in METRIC_ALIASES[category]:
        if key not in metrics or metrics[key] is None:
            continue
        value = metrics[key]
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"metric {key!r} must be a finite number or None")
        if not math.isfinite(value):
            raise ValueError(f"metric {key!r} must be a finite number or None")
        if category in ("quality", "reliability") and not 0 <= value <= 1:
            raise ValueError(f"metric {key!r} must be between 0 and 1")
        if category in ("latency", "cost") and value < 0:
            raise ValueError(f"metric {key!r} must be non-negative")
        return float(value), key
    return None, None


def rank_models(metrics_by_model, weights=None):
    """Rank models using weighted min-max normalized available metrics.

    Quality and reliability: higher is better.
    Latency and cost: lower is better.
    Missing metric categories are omitted and remaining weights are renormalized
    for each model. Each ranking entry reports metric coverage for transparency.
    """
    if not isinstance(metrics_by_model, dict) or not metrics_by_model:
        raise ValueError("metrics_by_model must be a non-empty dictionary")

    chosen_weights = _validate_weights(weights)
    raw = {}
    for name, metrics in metrics_by_model.items():
        if not isinstance(name, str) or not name.strip():
            raise ValueError("model names must be non-empty strings")
        if not isinstance(metrics, dict):
            raise ValueError(f"metrics for {name!r} must be a dictionary")
        raw[name] = {}
        for category in chosen_weights:
            value, source_key = _extract_metric(metrics, category)
            if value is not None:
                raw[name][category] = {"value": value, "source": source_key}

    normalized = {name: {} for name in raw}
    for category in chosen_weights:
        available = {
            name: values[category]["value"]
            for name, values in raw.items()
            if category in values
        }
        if not available:
            continue

        low, high = min(available.values()), max(available.values())
        for name, value in available.items():
            if high == low:
                score = 1.0
            elif category in ("latency", "cost"):
                score = (high - value) / (high - low)
            else:
                score = (value - low) / (high - low)
            normalized[name][category] = score

    ranked = []
    for name, values in raw.items():
        usable = normalized[name]
        if not usable:
            continue
        total_weight = sum(chosen_weights[key] for key in usable)
        score = sum(
            normalized_score * chosen_weights[key]
            for key, normalized_score in usable.items()
        ) / total_weight
        ranked.append({
            "model_name": name,
            "score": round(score, 6),
            "rank": 0,
            "metrics_used": {
                key: item["value"] for key, item in values.items()
            },
            "normalized_metrics": {
                key: round(value, 6) for key, value in usable.items()
            },
            "metric_coverage": len(usable) / len(chosen_weights),
        })

    ranked.sort(key=lambda item: (-item["score"], item["model_name"]))
    for position, item in enumerate(ranked, start=1):
        item["rank"] = position
    return ranked
