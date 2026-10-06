from __future__ import annotations

from ai.routing_engine.classifier import RequestClassifier
from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.models import RoutingRequest

from .policies import PolicyDecision
from .rules import (
    capability_rule,
    cost_rule,
    latency_rule,
    quality_rule,
    tier_rule,
)


class PolicyRouter:
    """
    Deterministic v1 policy router.

    Converts the classifier's TaskProfile and the original RoutingRequest
    into routing constraints consumed by the model catalog and selector.

    Explicit request constraints always take precedence over inferred
    classifier policies.

    Optimization objectives remain the responsibility of the model
    selector. The policy router only applies hard constraints and
    meaningful inferred defaults.
    """

    def __init__(
        self,
        classifier: RequestClassifier | None = None,
    ) -> None:
        self.classifier = (
            classifier
            if classifier is not None
            else RequestClassifier()
        )

    @staticmethod
    def _should_infer_tier(
        request: RoutingRequest,
    ) -> bool:
        """
        Decide whether the policy router should infer a preferred tier.

        Explicit optimization objectives must be allowed to evaluate
        eligible models across tiers. Otherwise an inferred tier would
        become an unintended hard catalog filter.
        """
        if request.preferred_tier is not None:
            return False

        if request.objective in {
            RoutingObjective.COST,
            RoutingObjective.LATENCY,
            RoutingObjective.QUALITY,
        }:
            return False

        return True

    def apply(
        self,
        request: RoutingRequest,
    ) -> PolicyDecision:
        profile = self.classifier.classify(request)

        # ---------------------------------------------------------------
        # Explicit request constraints have highest priority.
        # ---------------------------------------------------------------

        if request.preferred_tier is not None:
            preferred_tier = request.preferred_tier
        elif self._should_infer_tier(request):
            preferred_tier = tier_rule(profile)
        else:
            preferred_tier = None

        required_capabilities = capability_rule(profile)

        min_quality = (
            request.min_quality
            if request.min_quality is not None
            else quality_rule(profile)
        )

        max_cost = (
            request.max_cost
            if request.max_cost is not None
            else cost_rule(profile)
        )

        max_latency_ms = (
            request.max_latency_ms
            if request.max_latency_ms is not None
            else latency_rule(profile)
        )

        reasons: list[str] = []
        policies: list[str] = []

        if preferred_tier:
            policies.append("tier_policy")

            if request.preferred_tier is not None:
                reasons.append(
                    f"Explicit preferred tier: {preferred_tier}."
                )
            else:
                reasons.append(
                    f"Inferred preferred tier: {preferred_tier}."
                )

        elif request.objective in {
            RoutingObjective.COST,
            RoutingObjective.LATENCY,
            RoutingObjective.QUALITY,
        }:
            policies.append("objective_policy")
            reasons.append(
                f"Optimization objective preserved for selector: "
                f"{request.objective.value}."
            )

        if required_capabilities:
            policies.append("capability_policy")
            reasons.append(
                "Required capabilities: "
                + ", ".join(required_capabilities)
                + "."
            )

        if min_quality is not None:
            policies.append("quality_policy")

            if request.min_quality is not None:
                reasons.append(
                    f"Explicit minimum quality: {min_quality}."
                )
            else:
                reasons.append(
                    f"Inferred minimum quality: {min_quality}."
                )

        if max_cost is not None:
            policies.append("cost_policy")

            if request.max_cost is not None:
                reasons.append(
                    f"Explicit maximum cost: {max_cost}."
                )
            else:
                reasons.append(
                    f"Inferred maximum cost: {max_cost}."
                )

        if max_latency_ms is not None:
            policies.append("latency_policy")

            if request.max_latency_ms is not None:
                reasons.append(
                    f"Explicit maximum latency: {max_latency_ms} ms."
                )
            else:
                reasons.append(
                    f"Inferred maximum latency: {max_latency_ms} ms."
                )

        if profile.streaming_required:
            policies.append("streaming_policy")
            reasons.append("Streaming is required.")

        return PolicyDecision(
            allowed=True,
            preferred_tier=preferred_tier,
            required_capabilities=required_capabilities,
            min_quality=min_quality,
            max_cost=max_cost,
            max_latency_ms=max_latency_ms,
            streaming_required=profile.streaming_required,
            policies_applied=tuple(policies),
            reasons=tuple(reasons),
            metadata={
                "policy_router_version": "v1",
                "classifier_confidence": profile.confidence,
                "task_type": profile.task_type.value,
                "complexity": profile.complexity.value,
                "reasoning_level": profile.reasoning_level.value,
                "explicit_constraints_take_precedence": True,
                "optimization_objective_preserved": (
                    request.objective.value
                ),
            },
        )


__all__ = ["PolicyRouter"]
