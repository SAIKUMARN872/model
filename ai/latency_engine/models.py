from __future__ import annotations

from dataclasses import dataclass, field
from time import time
from typing import Any


@dataclass(frozen=True)
class LatencyObservation:
    """A measured latency observation for one inference request."""

    request_id: str
    model_id: str
    provider: str
    tier: str
    total_latency_ms: float
    ttft_ms: float | None = None
    queue_latency_ms: float | None = None
    generation_latency_ms: float | None = None
    input_tokens: int = 0
    output_tokens: int = 0
    success: bool = True
    task_type: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time)

    def __post_init__(self) -> None:
        if not self.request_id.strip():
            raise ValueError("request_id cannot be empty")

        if not self.model_id.strip():
            raise ValueError("model_id cannot be empty")

        if not self.provider.strip():
            raise ValueError("provider cannot be empty")

        if not self.tier.strip():
            raise ValueError("tier cannot be empty")

        if float(self.total_latency_ms) < 0.0:
            raise ValueError("total_latency_ms cannot be negative")

        for name, value in (
            ("ttft_ms", self.ttft_ms),
            ("queue_latency_ms", self.queue_latency_ms),
            ("generation_latency_ms", self.generation_latency_ms),
        ):
            if value is not None and float(value) < 0.0:
                raise ValueError(f"{name} cannot be negative")

        if self.input_tokens < 0:
            raise ValueError("input_tokens cannot be negative")

        if self.output_tokens < 0:
            raise ValueError("output_tokens cannot be negative")


@dataclass(frozen=True)
class LatencyStatistics:
    """Statistical latency summary for a collection of observations."""

    samples: int
    average_ms: float
    p50_ms: float
    p95_ms: float
    p99_ms: float
    minimum_ms: float
    maximum_ms: float


@dataclass(frozen=True)
class LatencyPrediction:
    """Predicted latency for a model/provider target."""

    model_id: str
    provider: str
    predicted_latency_ms: float
    confidence: float = 0.0
    samples: int = 0
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.model_id.strip():
            raise ValueError("model_id cannot be empty")

        if not self.provider.strip():
            raise ValueError("provider cannot be empty")

        if float(self.predicted_latency_ms) < 0.0:
            raise ValueError("predicted_latency_ms cannot be negative")

        if not 0.0 <= float(self.confidence) <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")

        if self.samples < 0:
            raise ValueError("samples cannot be negative")


@dataclass(frozen=True)
class SLAResult:
    """Result of checking an observed or predicted latency against an SLA."""

    target_latency_ms: float
    actual_latency_ms: float
    compliant: bool
    margin_ms: float
    utilization: float

    def __post_init__(self) -> None:
        if float(self.target_latency_ms) <= 0.0:
            raise ValueError("target_latency_ms must be greater than zero")

        if float(self.actual_latency_ms) < 0.0:
            raise ValueError("actual_latency_ms cannot be negative")


@dataclass(frozen=True)
class LatencyDegradation:
    """Detected latency degradation for a model/provider target."""

    model_id: str
    provider: str
    baseline_latency_ms: float
    current_latency_ms: float
    increase_percent: float
    degraded: bool
    threshold_percent: float
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.model_id.strip():
            raise ValueError("model_id cannot be empty")

        if not self.provider.strip():
            raise ValueError("provider cannot be empty")

        if float(self.baseline_latency_ms) <= 0.0:
            raise ValueError("baseline_latency_ms must be greater than zero")

        if float(self.current_latency_ms) < 0.0:
            raise ValueError("current_latency_ms cannot be negative")

        if float(self.threshold_percent) < 0.0:
            raise ValueError("threshold_percent cannot be negative")


__all__ = [
    "LatencyObservation",
    "LatencyStatistics",
    "LatencyPrediction",
    "SLAResult",
    "LatencyDegradation",
]
