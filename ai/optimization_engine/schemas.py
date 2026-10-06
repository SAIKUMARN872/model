from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, List, Optional

from .models import (
    OptimizationAction,
    OptimizationCandidate,
    OptimizationConstraints,
    OptimizationDecision,
    OptimizationObjective,
    OptimizationRecord,
    OptimizationRequest,
    OptimizationResult,
    OptimizationScore,
    OptimizationWeights,
)


@dataclass(frozen=True)
class OptimizationWeightsSchema:
    cost: Decimal = Decimal("0.33")
    latency: Decimal = Decimal("0.33")
    quality: Decimal = Decimal("0.34")

    def to_model(self) -> OptimizationWeights:
        return OptimizationWeights(
            cost=self.cost,
            latency=self.latency,
            quality=self.quality,
        )

    @classmethod
    def from_model(
        cls,
        weights: OptimizationWeights,
    ) -> "OptimizationWeightsSchema":
        return cls(
            cost=weights.cost,
            latency=weights.latency,
            quality=weights.quality,
        )


@dataclass(frozen=True)
class OptimizationConstraintsSchema:
    max_cost: Optional[Decimal] = None
    max_latency_ms: Optional[Decimal] = None
    min_quality_score: Optional[Decimal] = None
    allowed_models: List[str] = field(
        default_factory=list
    )
    allowed_providers: List[str] = field(
        default_factory=list
    )

    def to_model(self) -> OptimizationConstraints:
        return OptimizationConstraints(
            max_cost=self.max_cost,
            max_latency_ms=self.max_latency_ms,
            min_quality_score=self.min_quality_score,
            allowed_models=list(self.allowed_models),
            allowed_providers=list(self.allowed_providers),
        )

    @classmethod
    def from_model(
        cls,
        constraints: OptimizationConstraints,
    ) -> "OptimizationConstraintsSchema":
        return cls(
            max_cost=constraints.max_cost,
            max_latency_ms=constraints.max_latency_ms,
            min_quality_score=constraints.min_quality_score,
            allowed_models=list(constraints.allowed_models),
            allowed_providers=list(
                constraints.allowed_providers
            ),
        )


@dataclass(frozen=True)
class OptimizationCandidateSchema:
    model: str
    provider: str
    estimated_cost: Decimal
    estimated_latency_ms: Decimal
    quality_score: Decimal
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    def to_model(self) -> OptimizationCandidate:
        return OptimizationCandidate(
            model=self.model,
            provider=self.provider,
            estimated_cost=self.estimated_cost,
            estimated_latency_ms=self.estimated_latency_ms,
            quality_score=self.quality_score,
            metadata=dict(self.metadata),
        )

    @classmethod
    def from_model(
        cls,
        candidate: OptimizationCandidate,
    ) -> "OptimizationCandidateSchema":
        return cls(
            model=candidate.model,
            provider=candidate.provider,
            estimated_cost=candidate.estimated_cost,
            estimated_latency_ms=candidate.estimated_latency_ms,
            quality_score=candidate.quality_score,
            metadata=dict(candidate.metadata),
        )


@dataclass(frozen=True)
class OptimizationRequestSchema:
    model: Optional[str] = None
    provider: Optional[str] = None
    objective: OptimizationObjective = (
        OptimizationObjective.BALANCED
    )
    weights: OptimizationWeightsSchema = field(
        default_factory=OptimizationWeightsSchema
    )
    constraints: OptimizationConstraintsSchema = field(
        default_factory=OptimizationConstraintsSchema
    )
    candidates: List[OptimizationCandidateSchema] = field(
        default_factory=list
    )
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    def to_model(self) -> OptimizationRequest:
        return OptimizationRequest(
            model=self.model,
            provider=self.provider,
            objective=self.objective,
            weights=self.weights.to_model(),
            constraints=self.constraints.to_model(),
            candidates=[
                candidate.to_model()
                for candidate in self.candidates
            ],
            request_id=self.request_id,
            metadata=dict(self.metadata),
        )


@dataclass(frozen=True)
class OptimizationScoreSchema:
    model: str
    provider: str
    cost_score: Decimal
    latency_score: Decimal
    quality_score: Decimal
    total_score: Decimal

    @classmethod
    def from_model(
        cls,
        score: OptimizationScore,
    ) -> "OptimizationScoreSchema":
        return cls(
            model=score.model,
            provider=score.provider,
            cost_score=score.cost_score,
            latency_score=score.latency_score,
            quality_score=score.quality_score,
            total_score=score.total_score,
        )


@dataclass(frozen=True)
class OptimizationDecisionSchema:
    action: OptimizationAction
    selected_model: Optional[str]
    selected_provider: Optional[str]
    score: Optional[OptimizationScoreSchema]
    reason: str
    objective: OptimizationObjective
    request_id: Optional[str]
    optimized: bool
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    @classmethod
    def from_model(
        cls,
        decision: OptimizationDecision,
    ) -> "OptimizationDecisionSchema":
        return cls(
            action=decision.action,
            selected_model=decision.selected_model,
            selected_provider=decision.selected_provider,
            score=(
                OptimizationScoreSchema.from_model(
                    decision.score
                )
                if decision.score is not None
                else None
            ),
            reason=decision.reason,
            objective=decision.objective,
            request_id=decision.request_id,
            optimized=decision.optimized,
            metadata=dict(decision.metadata),
        )


@dataclass(frozen=True)
class OptimizationResultSchema:
    decision: OptimizationDecisionSchema
    candidates_evaluated: int
    candidates_feasible: int
    baseline_model: Optional[str]
    baseline_provider: Optional[str]
    baseline_cost: Optional[Decimal]
    optimized_cost: Optional[Decimal]
    baseline_latency_ms: Optional[Decimal]
    optimized_latency_ms: Optional[Decimal]
    baseline_quality: Optional[Decimal]
    optimized_quality: Optional[Decimal]
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    @classmethod
    def from_model(
        cls,
        result: OptimizationResult,
    ) -> "OptimizationResultSchema":
        return cls(
            decision=OptimizationDecisionSchema.from_model(
                result.decision
            ),
            candidates_evaluated=result.candidates_evaluated,
            candidates_feasible=result.candidates_feasible,
            baseline_model=result.baseline_model,
            baseline_provider=result.baseline_provider,
            baseline_cost=result.baseline_cost,
            optimized_cost=result.optimized_cost,
            baseline_latency_ms=result.baseline_latency_ms,
            optimized_latency_ms=result.optimized_latency_ms,
            baseline_quality=result.baseline_quality,
            optimized_quality=result.optimized_quality,
            metadata=dict(result.metadata),
        )


@dataclass(frozen=True)
class OptimizationRecordSchema:
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
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    @classmethod
    def from_model(
        cls,
        record: OptimizationRecord,
    ) -> "OptimizationRecordSchema":
        return cls(
            request_id=record.request_id,
            original_model=record.original_model,
            original_provider=record.original_provider,
            optimized_model=record.optimized_model,
            optimized_provider=record.optimized_provider,
            objective=record.objective,
            baseline_cost=record.baseline_cost,
            optimized_cost=record.optimized_cost,
            baseline_latency_ms=record.baseline_latency_ms,
            optimized_latency_ms=record.optimized_latency_ms,
            baseline_quality=record.baseline_quality,
            optimized_quality=record.optimized_quality,
            metadata=dict(record.metadata),
        )


__all__ = [
    "OptimizationWeightsSchema",
    "OptimizationConstraintsSchema",
    "OptimizationCandidateSchema",
    "OptimizationRequestSchema",
    "OptimizationScoreSchema",
    "OptimizationDecisionSchema",
    "OptimizationResultSchema",
    "OptimizationRecordSchema",
]
