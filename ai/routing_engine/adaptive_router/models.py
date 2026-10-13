from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class AdaptiveModelSignal:
    "Historical routing signal for one model."

    model_id: str
    samples: int = 0
    quality_score: float | None = None
    latency_ms: float | None = None
    cost: float | None = None
    success_rate: float | None = None
    reward: float | None = None
    confidence: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class AdaptiveRoutingScore:
    "Adaptive routing score for a candidate model."

    model_id: str
    score: float
    base_score: float
    adaptive_score: float
    signal: AdaptiveModelSignal | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


__all__ = [
    "AdaptiveModelSignal",
    "AdaptiveRoutingScore",
]
