from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional


class OptimizationObjective(str, Enum):
    """Primary objective for optimization."""

    COST = "cost"
    LATENCY = "latency"
    QUALITY = "quality"
    BALANCED = "balanced"


class OptimizationAction(str, Enum):
    """Action selected by the optimization engine."""

    KEEP = "keep"
    SWITCH_MODEL = "switch_model"
    SWITCH_PROVIDER = "switch_provider"
    CHANGE_ROUTE = "change_route"
    REJECT = "reject"


@dataclass(frozen=True)
class OptimizationWeights:
    """Relative importance of cost, latency, and quality."""

    cost: Decimal = Decimal("0.33")
    latency: Decimal = Decimal("0.33")
    quality: Decimal = Decimal("0.34")

    @property
    def total(self) -> Decimal:
        return self.cost + self.latency + self.quality


@dataclass(frozen=True)
class OptimizationConstraints:
    """Constraints that an optimization decision must respect."""

    max_cost: Optional[Decimal] = None
    max_latency_ms: Optional[Decimal] = None
    min_quality_score: Optional[Decimal] = None
    allowed_models: List[str] = field(default_factory=list)
    allowed_providers: List[str] = field(default_factory=list)


@dataclass(frozen=True)
class OptimizationCandidate:
    """Candidate model/provider route evaluated by the optimizer."""

    model: str
    provider: str
    estimated_cost: Decimal
    estimated_latency_ms: Decimal
    quality_score: Decimal
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class OptimizationRequest:
    """Input to the optimization engine."""

    model: Optional[str] = None
    provider: Optional[str] = None
    objective: OptimizationObjective = OptimizationObjective.BALANCED
    weights: OptimizationWeights = field(
        default_factory=OptimizationWeights
    )
    constraints: OptimizationConstraints = field(
        default_factory=OptimizationConstraints
    )
    candidates: List[OptimizationCandidate] = field(
        default_factory=list
    )
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class OptimizationScore:
    """Normalized optimization score for a candidate."""

    model: str
    provider: str
    cost_score: Decimal
    latency_score: Decimal
    quality_score: Decimal
    total_score: Decimal


@dataclass(frozen=True)
class OptimizationDecision:
    """Final optimization decision."""

    action: OptimizationAction
    selected_model: Optional[str]
    selected_provider: Optional[str]
    score: Optional[OptimizationScore]
    reason: str
    objective: OptimizationObjective
    request_id: Optional[str] = None
    optimized: bool = False
    generated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class OptimizationResult:
    """Complete result returned by the optimization engine."""

    decision: OptimizationDecision
    candidates_evaluated: int
    candidates_feasible: int
    baseline_model: Optional[str] = None
    baseline_provider: Optional[str] = None
    baseline_cost: Optional[Decimal] = None
    optimized_cost: Optional[Decimal] = None
    baseline_latency_ms: Optional[Decimal] = None
    optimized_latency_ms: Optional[Decimal] = None
    baseline_quality: Optional[Decimal] = None
    optimized_quality: Optional[Decimal] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class OptimizationRecord:
    """Historical record of an optimization decision."""

    request_id: str
    original_model: Optional[str]
    original_provider: Optional[str]
    optimized_model: Optional[str]
    optimized_provider: Optional[str]
    objective: OptimizationObjective
    baseline_cost: Optional[Decimal]
    optimized_cost: Optional[Decimal]
    baseline_latency_ms: Optional[Decimal]
    optimized_latency_ms: Optional[Decimal]
    baseline_quality: Optional[Decimal]
    optimized_quality: Optional[Decimal]
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


__all__ = [
    "OptimizationObjective",
    "OptimizationAction",
    "OptimizationWeights",
    "OptimizationConstraints",
    "OptimizationCandidate",
    "OptimizationRequest",
    "OptimizationScore",
    "OptimizationDecision",
    "OptimizationResult",
    "OptimizationRecord",
]
