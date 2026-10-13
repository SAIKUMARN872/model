from __future__ import annotations

from dataclasses import replace

from ai.model_registry.engine import ModelRegistryEngine
from ai.latency_engine.engine import LatencyEngine
from ai.routing_engine.adaptive_router import AdaptiveRoutingEngine
from ai.routing_engine.learning_router.feedback import FeedbackStore
from ai.routing_engine.model_memory.memory import ModelMemory
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
            ?
        Request Classifier
            ?
        Policy Router
            ?
        Policy-constrained RoutingRequest
            ?
        Model Catalog
            ?
        Candidate Models
            ?
        Model Selector
            ?
        RoutingDecision
    """

    def __init__(
        self,
        catalog: ModelCatalog | None = None,
        selector: ModelSelector | None = None,
        registry: ModelRegistryEngine | None = None,
        policy_router: PolicyRouter | None = None,
        latency_engine: LatencyEngine | None = None,
        model_memory: ModelMemory | None = None,
        feedback_store: FeedbackStore | None = None,
        adaptive_router: AdaptiveRoutingEngine | None = None,
    ) -> None:
        self.latency_engine = (
            latency_engine
            if latency_engine is not None
            else LatencyEngine()
        )

        self.model_memory = (
            model_memory
            if model_memory is not None
            else ModelMemory()
        )

        self.feedback_store = (
            feedback_store
            if feedback_store is not None
            else FeedbackStore()
        )

        self.adaptive_router = (
            adaptive_router
            if adaptive_router is not None
            else AdaptiveRoutingEngine(
                model_memory=self.model_memory,
                feedback_store=self.feedback_store,
            )
        )

        if catalog is not None:
            self.catalog = catalog
        else:
            if registry is None:
                registry = ModelRegistryEngine()

            self.catalog = ModelRegistryCatalog(
                registry,
                latency_engine=self.latency_engine,
            )

        self.selector = (
            selector
            if selector is not None
            else DefaultModelSelector(
                adaptive_router=self.adaptive_router,
            )
        )

        self.policy_router = (
            policy_router
            if policy_router is not None
            else PolicyRouter(
                classifier=RequestClassifier(),
            )
        )

    @property
    def registry(self) -> ModelRegistryEngine | None:
        """Return the canonical registry when the catalog is registry-backed."""
        if isinstance(self.catalog, ModelRegistryCatalog):
            return self.catalog.registry

        return None

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
        policy_metadata = dict(policy.metadata)

        task_type = metadata.get("task_type")
        if task_type is None or not str(task_type).strip():
            task_type = policy_metadata.get("task_type")

        if task_type is not None and str(task_type).strip():
            metadata["task_type"] = str(task_type).strip().lower()

        metadata.update(
            {
                "policy_router_applied": True,
                "policy_preferred_tier": policy.preferred_tier,
                "policy_min_quality": policy.min_quality,
                "policy_max_cost": policy.max_cost,
                "policy_max_latency_ms": policy.max_latency_ms,
                "policy_quality_weight": policy.quality_weight,
                "policy_cost_weight": policy.cost_weight,
                "policy_latency_weight": policy.latency_weight,
                "policy_streaming_required": (
                    policy.streaming_required
                ),
                "policies_applied": policy.policies_applied,
                "policy_reasons": policy.reasons,
                "policy_metadata": policy_metadata,
                "explicit_max_cost": (
                    request.max_cost is not None
                ),
                "estimated_input_tokens": request.metadata.get(
                    "estimated_input_tokens",
                    policy.metadata.get("estimated_input_tokens"),
                ),
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
                "quality_weight": policy.quality_weight,
                "cost_weight": policy.cost_weight,
                "latency_weight": policy.latency_weight,
                "required_capabilities": (
                    policy.required_capabilities
                ),
                "policies_applied": policy.policies_applied,
                "task_type": constrained_request.metadata.get(
                    "task_type"
                ),
            }
        )

        return replace(
            decision,
            metadata=decision_metadata,
        )


__all__ = [
    "RoutingEngine",
]

