from __future__ import annotations

from dataclasses import replace
from decimal import Decimal
from typing import Any

from ai.inference_engine.engine import InferenceEngine
from ai.inference_engine.models import (
    InferenceRequest,
    InferenceResult,
)
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.models import (
    ModelCandidate,
    RoutingRequest,
)

from .engine import OptimizationEngine
from .models import (
    OptimizationCandidate,
    OptimizationConstraints,
    OptimizationObjective,
    OptimizationRequest,
    OptimizationResult,
    OptimizationWeights,
)


class OptimizationInferenceAdapter:
    """
    Connect ModelNow routing, optimization, and inference.

    Flow:

        RoutingRequest
            |
            v
        RoutingEngine.apply_policy()
            |
            v
        Policy-constrained RoutingRequest
            |
            v
        RoutingEngine.get_candidates()
            |
            v
        ModelCandidate[]
            |
            v
        OptimizationCandidate[]
            |
            v
        OptimizationEngine.optimize()
            |
            v
        Optimized model/provider
            |
            v
        InferenceEngine.infer()
            |
            v
        InferenceResult

    Pricing note:

        ModelCandidate input_cost/output_cost are registry pricing
        rates expressed per 1M tokens. They are therefore used here
        as a normalized candidate pricing signal, not as the final
        request cost.

        Actual request cost must be calculated after inference from
        actual token usage.
    """

    def __init__(
        self,
        *,
        routing_engine: RoutingEngine,
        optimization_engine: OptimizationEngine | None = None,
        inference_engine: InferenceEngine,
    ) -> None:
        self.routing_engine = routing_engine

        self.optimization_engine = (
            optimization_engine
            if optimization_engine is not None
            else OptimizationEngine()
        )

        self.inference_engine = inference_engine

    async def get_routing_candidates(
        self,
        request: RoutingRequest,
    ) -> tuple[RoutingRequest, list[ModelCandidate]]:
        """
        Apply routing policy once, preserve the resulting policy
        decision in request metadata, and return the candidates.

        This ensures the optimization layer receives the same
        objective, weights, and constraints determined by the
        PolicyRouter.
        """

        policy = self.routing_engine.apply_policy(
            request
        )

        if not policy.allowed:
            raise ValueError(
                "Routing request denied by policy: "
                + "; ".join(policy.reasons)
            )

        metadata = dict(
            request.metadata
        )

        metadata.update(
            {
                "policy_decision": policy,
                "policy_quality_weight": (
                    policy.quality_weight
                ),
                "policy_cost_weight": (
                    policy.cost_weight
                ),
                "policy_latency_weight": (
                    policy.latency_weight
                ),
                "policy_min_quality": (
                    policy.min_quality
                ),
                "policy_max_cost": (
                    policy.max_cost
                ),
                "policy_max_latency_ms": (
                    policy.max_latency_ms
                ),
                "policy_streaming_required": (
                    policy.streaming_required
                ),
                "policies_applied": (
                    policy.policies_applied
                ),
                "policy_reasons": (
                    policy.reasons
                ),
                "policy_metadata": (
                    policy.metadata
                ),
            }
        )

        constrained_request = replace(
            request,
            metadata=metadata,
        )

        candidates = (
            await self.routing_engine.get_candidates(
                constrained_request
            )
        )

        return (
            constrained_request,
            candidates,
        )

    @staticmethod
    def to_optimization_candidate(
        candidate: ModelCandidate,
    ) -> OptimizationCandidate:
        """
        Convert a routing ModelCandidate into an OptimizationCandidate.

        The registry exposes input/output prices per 1M tokens.
        Their sum is retained as a normalized pricing-rate signal
        for candidate comparison.
        """

        input_cost = float(
            candidate.input_cost
        )

        output_cost = float(
            candidate.output_cost
        )

        estimated_cost = (
            input_cost + output_cost
        )

        latency = (
            candidate.estimated_latency_ms
        )

        if latency is None:
            raise ValueError(
                "Missing latency for optimization candidate: "
                f"{candidate.provider}:{candidate.model_id}"
            )

        return OptimizationCandidate(
            model=candidate.model_id,
            provider=candidate.provider,
            estimated_cost=estimated_cost,
            estimated_latency_ms=float(
                latency
            ),
            quality_score=float(
                candidate.quality
            ),
            metadata={
                "tier": candidate.tier,
                "capabilities": (
                    candidate.capabilities
                ),
                "enabled": candidate.enabled,
                "pricing_unit": (
                    "per_1m_tokens_combined"
                ),
                "input_price_per_1m_tokens": (
                    input_cost
                ),
                "output_price_per_1m_tokens": (
                    output_cost
                ),
                **candidate.metadata,
            },
        )

    @classmethod
    def to_optimization_candidates(
        cls,
        candidates: list[ModelCandidate],
    ) -> list[OptimizationCandidate]:
        """Convert all routing candidates for optimization."""

        return [
            cls.to_optimization_candidate(
                candidate
            )
            for candidate in candidates
        ]

    @staticmethod
    def _decimal_weight(
        value: float,
    ) -> Decimal:
        """
        Convert a policy weight to Decimal without binary
        floating-point drift.
        """

        return Decimal(
            str(value)
        )

    @classmethod
    def build_optimization_request(
        cls,
        request: RoutingRequest,
        candidates: list[OptimizationCandidate],
    ) -> OptimizationRequest:
        """
        Build an OptimizationRequest from a RoutingRequest.

        PolicyRouter weights are preserved so the optimization layer
        follows the actual request objective and applicable policy
        instead of silently reverting to balanced defaults.
        """

        objective = OptimizationObjective(
            request.objective.value
        )

        request_id = request.metadata.get(
            "request_id"
        )

        if request_id is not None:
            request_id = str(
                request_id
            )

        metadata = dict(
            request.metadata
        )

        metadata.update(
            {
                "routing_required_capabilities": (
                    request.required_capabilities
                ),
                "routing_preferred_tier": (
                    request.preferred_tier
                ),
            }
        )

        policy_decision = request.metadata.get(
            "policy_decision"
        )

        quality_weight = 0.50
        cost_weight = 0.25
        latency_weight = 0.25

        if policy_decision is not None:
            quality_weight = float(
                getattr(
                    policy_decision,
                    "quality_weight",
                    quality_weight,
                )
            )

            cost_weight = float(
                getattr(
                    policy_decision,
                    "cost_weight",
                    cost_weight,
                )
            )

            latency_weight = float(
                getattr(
                    policy_decision,
                    "latency_weight",
                    latency_weight,
                )
            )

        else:
            quality_weight = float(
                request.metadata.get(
                    "policy_quality_weight",
                    quality_weight,
                )
            )

            cost_weight = float(
                request.metadata.get(
                    "policy_cost_weight",
                    cost_weight,
                )
            )

            latency_weight = float(
                request.metadata.get(
                    "policy_latency_weight",
                    latency_weight,
                )
            )

        weights = OptimizationWeights(
            cost=cls._decimal_weight(
                cost_weight
            ),
            latency=cls._decimal_weight(
                latency_weight
            ),
            quality=cls._decimal_weight(
                quality_weight
            ),
        )

        metadata.update(
            {
                "optimization_quality_weight": (
                    quality_weight
                ),
                "optimization_cost_weight": (
                    cost_weight
                ),
                "optimization_latency_weight": (
                    latency_weight
                ),
                "optimization_weight_source": (
                    "policy_router"
                    if policy_decision is not None
                    else "routing_request_metadata"
                ),
            }
        )

        constraints = OptimizationConstraints(
            max_cost=(
                Decimal(
                    str(request.max_cost)
                )
                if request.max_cost is not None
                else None
            ),
            max_latency_ms=(
                Decimal(
                    str(request.max_latency_ms)
                )
                if request.max_latency_ms is not None
                else None
            ),
            min_quality_score=(
                Decimal(
                    str(request.min_quality)
                )
                if request.min_quality is not None
                else None
            ),
        )

        return OptimizationRequest(
            model=request.model,
            provider=None,
            objective=objective,
            weights=weights,
            constraints=constraints,
            candidates=candidates,
            request_id=request_id,
            metadata=metadata,
        )

    @staticmethod
    def to_inference_request(
        request: RoutingRequest,
        result: OptimizationResult,
    ) -> InferenceRequest:
        """
        Convert the optimization result into an InferenceRequest.

        The selected provider is preserved in metadata because the
        current InferenceRequest identifies the model but does not
        contain a dedicated provider field.
        """

        selected_model = (
            result.decision.selected_model
        )

        if not selected_model:
            raise ValueError(
                "Optimization did not select a model"
            )

        metadata: dict[str, Any] = dict(
            request.metadata
        )

        score = result.decision.score

        metadata.update(
            {
                "optimization_applied": True,
                "optimization_model": (
                    selected_model
                ),
                "optimization_provider": (
                    result.decision.selected_provider
                ),
                "optimization_objective": (
                    result.decision.objective.value
                ),
                "optimization_score": (
                    score.total_score
                    if score is not None
                    else None
                ),
                "optimization_action": (
                    result.decision.action.value
                ),
                "optimization_reason": (
                    result.decision.reason
                ),
                "optimization_candidates_evaluated": (
                    result.candidates_evaluated
                ),
                "optimization_candidates_feasible": (
                    result.candidates_feasible
                ),
                "optimization_baseline_model": (
                    result.baseline_model
                ),
                "optimization_baseline_provider": (
                    result.baseline_provider
                ),
                "optimization_baseline_cost": (
                    result.baseline_cost
                ),
                "optimization_selected_cost": (
                    result.optimized_cost
                ),
                "optimization_baseline_latency_ms": (
                    result.baseline_latency_ms
                ),
                "optimization_selected_latency_ms": (
                    result.optimized_latency_ms
                ),
                "optimization_baseline_quality": (
                    result.baseline_quality
                ),
                "optimization_selected_quality": (
                    result.optimized_quality
                ),
            }
        )

        return InferenceRequest(
            model=selected_model,
            messages=list(
                request.messages
            ),
            provider=result.decision.selected_provider,
            stream=request.stream,
            request_id=(
                str(
                    request.metadata[
                        "request_id"
                    ]
                )
                if request.metadata.get(
                    "request_id"
                ) is not None
                else None
            ),
            metadata=metadata,
        )

    async def optimize(
        self,
        request: RoutingRequest,
    ) -> OptimizationResult:
        """
        Run policy-aware routing candidate discovery followed by
        optimization.
        """

        (
            constrained_request,
            routing_candidates,
        ) = await self.get_routing_candidates(
            request
        )

        if not routing_candidates:
            raise ValueError(
                "No routing candidates available for optimization"
            )

        optimization_candidates = (
            self.to_optimization_candidates(
                routing_candidates
            )
        )

        optimization_request = (
            self.build_optimization_request(
                constrained_request,
                optimization_candidates,
            )
        )

        return self.optimization_engine.optimize(
            optimization_request
        )

    async def optimize_and_infer(
        self,
        request: RoutingRequest,
    ) -> tuple[
        OptimizationResult,
        InferenceRequest,
        InferenceResult,
    ]:
        """
        Run automatic policy-aware optimization followed by real
        inference execution.
        """

        (
            optimization_result,
            inference_request,
            result,
        ) = await self._optimize_and_build_inference(
            request
        )

        return (
            optimization_result,
            inference_request,
            result,
        )

    async def _optimize_and_build_inference(
        self,
        request: RoutingRequest,
    ) -> tuple[
        OptimizationResult,
        InferenceRequest,
        InferenceResult,
    ]:
        """
        Internal execution path that keeps the optimization and
        inference stages explicit.
        """

        optimization_result = await self.optimize(
            request
        )

        inference_request = (
            self.to_inference_request(
                request,
                optimization_result,
            )
        )

        result = await self.inference_engine.infer(
            inference_request
        )

        return (
            optimization_result,
            inference_request,
            result,
        )


__all__ = [
    "OptimizationInferenceAdapter",
]


