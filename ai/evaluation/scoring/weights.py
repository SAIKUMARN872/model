"""Configurable scoring weights for ModelNow evaluation."""
from __future__ import annotations

import math
from collections.abc import Mapping

DEFAULT_SCORING_WEIGHTS = {
    "quality": 0.50,
    "latency": 0.25,
    "cost": 0.15,
    "reliability": 0.10,
}

SUPPORTED_SCORING_METRICS = frozenset(DEFAULT_SCORING_WEIGHTS)


def validate_weights(weights: Mapping[str, float] | None = None) -> dict[str, float]:
    """Validate weights and normalize them to sum to 1."""
    chosen = DEFAULT_SCORING_WEIGHTS if weights is None else weights

    if not isinstance(chosen, Mapping) or not chosen:
        raise ValueError("weights must be a non-empty mapping")

    normalized = {}
    for name, value in chosen.items():
        if name not in SUPPORTED_SCORING_METRICS:
            raise ValueError(f"unsupported scoring metric: {name!r}")
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"weight for {name!r} must be a finite positive number")
        if not math.isfinite(value) or value <= 0:
            raise ValueError(f"weight for {name!r} must be a finite positive number")
        normalized[name] = float(value)

    total = sum(normalized.values())
    if not math.isfinite(total) or total <= 0:
        raise ValueError("total weight must be finite and positive")

    return {name: value / total for name, value in normalized.items()}
