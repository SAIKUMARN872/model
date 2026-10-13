from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class LatencyQuery:
    """Query parameters for latency history and analysis."""

    model_id: str | None = None
    provider: str | None = None
    tier: str | None = None
    task_type: str | None = None
    limit: int | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        for name, value in (
            ("model_id", self.model_id),
            ("provider", self.provider),
            ("tier", self.tier),
            ("task_type", self.task_type),
        ):
            if value is not None and not str(value).strip():
                raise ValueError(f"{name} cannot be empty")

        if self.limit is not None and self.limit <= 0:
            raise ValueError("limit must be greater than zero")


@dataclass(frozen=True)
class SLATarget:
    """Latency SLA configuration."""

    target_latency_ms: float
    warning_threshold_percent: float = 80.0
    degradation_threshold_percent: float = 25.0

    def __post_init__(self) -> None:
        if float(self.target_latency_ms) <= 0.0:
            raise ValueError(
                "target_latency_ms must be greater than zero"
            )

        if not 0.0 <= float(self.warning_threshold_percent) <= 100.0:
            raise ValueError(
                "warning_threshold_percent must be between 0 and 100"
            )

        if float(self.degradation_threshold_percent) < 0.0:
            raise ValueError(
                "degradation_threshold_percent cannot be negative"
            )


@dataclass(frozen=True)
class LatencyAnalysis:
    """Complete latency analysis result."""

    statistics: Any
    prediction: Any | None = None
    sla: Any | None = None
    degradation: Any | None = None


__all__ = [
    "LatencyQuery",
    "SLATarget",
    "LatencyAnalysis",
]
