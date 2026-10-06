from __future__ import annotations

from dataclasses import replace

from ai.model_registry.engine import ModelRegistryEngine
from ai.routing_engine.classifier import RequestClassifier
from ai.routing_engine.exceptions import NoRouteAvailableError
from ai.routing_engine.interfaces import ModelCatalog, ModelSelector
from ai.routing_engine.model_catalog import ModelRegistryCatalog
from ai.routing_engine.model_selector import DefaultModelSelector
from ai.routing_engine.models import (
    ModelCandidate,
    RoutingDecision,
    RoutingRequest,
)
from ai.routing_engine.policy_router import PolicyDecision, PolicyRouter


class RoutingEngine:
    """
    Core ModelNow routing engine.

    Flow:

        RoutingRequest
            ↓
        Request Classifier
            ↓
        Policy Router
            ↓
        Policy-constrained RoutingRequest
            ↓
        Model Catalog
            ↓
        Candidate Models
            ↓
        Model Selector
            ↓
        RoutingDecision
    """

    def __init__(
        self,
        catalog: ModelCatalog | None = None,
        selector: ModelSelector | None = None,
        registry: ModelRegistryEngine | None = None,
        policy_router: PolicyRouter | None = None,
    ) -> None:
        if catalog is not None:
            self.catalog = catalog
        else:
            if registry is None:
                registry = ModelRegistryEngine()

            self.catalog = ModelRegistryCatalog(registry)

        self.selector = (
            selector
            if selector is not None
            else DefaultModelSelector()
        )

        self.policy_router = (
            policy_router
            if policy_router is not None
            else PolicyRouter(
                classifier=RequestClassifier(),
            )
        )

    def apply_policy(
        self,
        request: RoutingRequest,
    ) -> PolicyDecision:
        return self.policy_router.apply(request)

    @staticmethod
    def _apply_policy_to_request(
        request: RoutingRequest,
        policy: PolicyDecision,
    ) -> RoutingRequest:
        """
        Convert a PolicyDecision into the existing RoutingRequest
        constraint format understood by ModelRegistryCatalog.

        Explicit request constraints have already been preserved by
        PolicyRouter and therefore remain authoritative.
        """

        metadata = dict(request.metadata)

        metadata.update(
            {
                "policy_router_applied": True,
                "policy_preferred_tier": policy.preferred_tier,
                "policy_min_quality": policy.min_quality,
                "policy_max_cost": policy.max_cost,
                "policy_max_latency_ms": policy.max_latency_ms,
                "policy_streaming_required": (
                    policy.streaming_required
                ),
                "policies_applied": policy.policies_applied,
                "policy_reasons": policy.reasons,
                "policy_metadata": policy.metadata,
            }
        )

        return replace(
            request,
            preferred_tier=policy.preferred_tier,
            required_capabilities=policy.required_capabilities,
            min_quality=policy.min_quality,
            max_cost=policy.max_cost,
            max_latency_ms=policy.max_latency_ms,
            stream=(
                request.stream
                or policy.streaming_required
            ),
            metadata=metadata,
        )

    async def get_candidates(
        self,
        request: RoutingRequest,
    ) -> list[ModelCandidate]:
        policy = self.apply_policy(request)

        if not policy.allowed:
            return []

        constrained_request = self._apply_policy_to_request(
            request,
            policy,
        )

        return await self.catalog.candidates(
            constrained_request
        )

    async def route(
        self,
        request: RoutingRequest,
    ) -> RoutingDecision:
        policy = self.apply_policy(request)

        if not policy.allowed:
            raise NoRouteAvailableError(
                "Routing request was rejected by policy."
            )

        constrained_request = self._apply_policy_to_request(
            request,
            policy,
        )

        candidates = await self.catalog.candidates(
            constrained_request
        )

        if not candidates:
            raise NoRouteAvailableError(
                "No models are available for the policy-constrained "
                "routing request."
            )

        decision = await self.selector.select(
            constrained_request,
            candidates,
        )

        decision_metadata = dict(decision.metadata)

        decision_metadata.update(
            {
                "policy_router_applied": True,
                "preferred_tier": policy.preferred_tier,
                "min_quality": policy.min_quality,
                "max_cost": policy.max_cost,
                "max_latency_ms": policy.max_latency_ms,
                "required_capabilities": (
                    policy.required_capabilities
                ),
                "policies_applied": policy.policies_applied,
            }
        )

        return replace(
            decision,
            metadata=decision_metadata,
        )


__all__ = [
    "RoutingEngine",
]
