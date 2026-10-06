from __future__ import annotations

from dataclasses import dataclass, field

from .constants import (
    DEFAULT_OBJECTIVE,
    RoutingObjective,
    RoutingStatus,
)


@dataclass(frozen=True)
class RoutingRequest:
    """Input to the ModelNow routing engine."""

    model: str | None = None
    messages: list[dict[str, object]] = field(default_factory=list)

    objective: RoutingObjective = DEFAULT_OBJECTIVE

    max_cost: float | None = None
    max_latency_ms: float | None = None
    min_quality: float | None = None

    required_capabilities: tuple[str, ...] = ()
    preferred_tier: str | None = None

    stream: bool = False

    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True)
class ModelCandidate:
    """A model eligible for routing."""

    model_id: str
    provider: str
    tier: str

    quality: float = 0.0
    input_cost: float = 0.0
    output_cost: float = 0.0
    estimated_latency_ms: float = 0.0

    capabilities: tuple[str, ...] = ()

    enabled: bool = True
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True)
class RoutingDecision:
    """Final routing decision."""

    status: RoutingStatus

    model_id: str | None = None
    provider: str | None = None
    tier: str | None = None

    score: float | None = None
    reason: str | None = None

    candidates_considered: int = 0
    metadata: dict[str, object] = field(default_factory=dict)


__all__ = [
    "RoutingRequest",
    "ModelCandidate",
    "RoutingDecision",
]
