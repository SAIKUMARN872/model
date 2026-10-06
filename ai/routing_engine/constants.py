from __future__ import annotations

from enum import StrEnum


class RoutingObjective(StrEnum):
    COST = "cost"
    LATENCY = "latency"
    QUALITY = "quality"
    BALANCED = "balanced"


class RoutingStatus(StrEnum):
    SELECTED = "selected"
    NO_MODEL = "no_model"
    FAILED = "failed"


DEFAULT_OBJECTIVE = RoutingObjective.BALANCED

MIN_QUALITY_SCORE = 0.0
MAX_QUALITY_SCORE = 1.0

MIN_COST = 0.0
MIN_LATENCY_MS = 0.0


__all__ = [
    "RoutingObjective",
    "RoutingStatus",
    "DEFAULT_OBJECTIVE",
    "MIN_QUALITY_SCORE",
    "MAX_QUALITY_SCORE",
    "MIN_COST",
    "MIN_LATENCY_MS",
]
