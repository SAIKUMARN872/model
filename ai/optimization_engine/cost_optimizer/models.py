from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, List, Optional

from ..models import OptimizationCandidate


@dataclass(frozen=True)
class CostOptimizationRequest:
    """Input for cost-focused optimization."""

    candidates: List[OptimizationCandidate]
    current_model: Optional[str] = None
    current_provider: Optional[str] = None
    max_latency_ms: Optional[Decimal] = None
    min_quality_score: Optional[Decimal] = None
    max_cost: Optional[Decimal] = None
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class CostOptimizationCandidate:
    """Candidate evaluated by the cost optimizer."""

    model: str
    provider: str
    estimated_cost: Decimal
    estimated_latency_ms: Decimal
    quality_score: Decimal
    savings: Decimal = Decimal("0")
    savings_percentage: Decimal = Decimal("0")
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class CostOptimizationResult:
    """Result of cost-focused optimization."""

    selected_model: Optional[str]
    selected_provider: Optional[str]
    selected_cost: Optional[Decimal]
    baseline_cost: Optional[Decimal]
    savings: Decimal
    savings_percentage: Decimal
    selected_latency_ms: Optional[Decimal]
    selected_quality_score: Optional[Decimal]
    candidates_evaluated: int
    candidates_feasible: int
    optimized: bool
    reason: str
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


__all__ = [
    "CostOptimizationRequest",
    "CostOptimizationCandidate",
    "CostOptimizationResult",
]
