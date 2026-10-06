from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, List, Optional

from ..models import OptimizationCandidate


@dataclass(frozen=True)
class LatencyOptimizationRequest:
    """Input for latency-focused optimization."""

    candidates: List[OptimizationCandidate]
    current_model: Optional[str] = None
    current_provider: Optional[str] = None
    max_cost: Optional[Decimal] = None
    min_quality_score: Optional[Decimal] = None
    max_latency_ms: Optional[Decimal] = None
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class LatencyOptimizationCandidate:
    """Candidate evaluated by the latency optimizer."""

    model: str
    provider: str
    estimated_cost: Decimal
    estimated_latency_ms: Decimal
    quality_score: Decimal
    latency_reduction_ms: Decimal = Decimal("0")
    latency_reduction_percentage: Decimal = Decimal("0")
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class LatencyOptimizationResult:
    """Result of latency-focused optimization."""

    selected_model: Optional[str]
    selected_provider: Optional[str]
    selected_latency_ms: Optional[Decimal]
    baseline_latency_ms: Optional[Decimal]
    latency_reduction_ms: Decimal
    latency_reduction_percentage: Decimal
    selected_cost: Optional[Decimal]
    selected_quality_score: Optional[Decimal]
    candidates_evaluated: int
    candidates_feasible: int
    optimized: bool
    reason: str
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class LatencyProfile:
    """Observed or predicted latency information."""

    model: str
    provider: str
    latency_ms: Decimal
    sample_count: int = 0
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


__all__ = [
    "LatencyOptimizationRequest",
    "LatencyOptimizationCandidate",
    "LatencyOptimizationResult",
    "LatencyProfile",
]
