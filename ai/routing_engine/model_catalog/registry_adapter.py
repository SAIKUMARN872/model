from __future__ import annotations

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import ModelRecord
from ai.routing_engine.models import ModelCandidate, RoutingRequest
from ai.routing_engine.utils import normalize_model_name, normalize_tier
from ai.routing_engine.interfaces import ModelCatalog


class ModelRegistryCatalog(ModelCatalog):
    """
    Routing catalog backed by the canonical ModelNow Model Registry.

    The Model Registry remains the single source of truth for model
    metadata. This adapter only converts ModelRecord objects into
    routing candidates.
    """

    def __init__(
        self,
        registry: ModelRegistryEngine,
    ) -> None:
        self.registry = registry

    @staticmethod
    def _capabilities(model: ModelRecord) -> tuple[str, ...]:
        capabilities = model.capabilities

        values: list[str] = []

        for name in (
            "chat",
            "reasoning",
            "code",
            "vision",
            "audio",
            "tool_use",
            "structured_output",
            "streaming",
            "long_context",
            "agentic",
        ):
            if getattr(capabilities, name, False):
                values.append(name)

        return tuple(values)

    @classmethod
    def _to_candidate(
        cls,
        model: ModelRecord,
    ) -> ModelCandidate:
        return ModelCandidate(
            model_id=model.model_id,
            provider=model.provider,
            tier=model.tier.value,
            quality=(
                model.quality_score
                if model.quality_score is not None
                else 0.0
            ),
            input_cost=model.pricing.input_per_1m_tokens,
            output_cost=model.pricing.output_per_1m_tokens,
            estimated_latency_ms=(
                model.latency_ms
                if model.latency_ms is not None
                else 0.0
            ),
            capabilities=cls._capabilities(model),
            enabled=model.enabled,
            metadata={
                "qualified_id": model.qualified_id,
                "display_name": model.display_name,
                "context_window": model.context_window,
                "max_output_tokens": model.max_output_tokens,
                "aliases": model.aliases,
                "available": model.available,
                "version": model.version,
                **model.metadata,
            },
        )

    @staticmethod
    def _matches_request(
        model: ModelRecord,
        request: RoutingRequest,
    ) -> bool:
        if not model.enabled or not model.available:
            return False

        requested_model = normalize_model_name(request.model)

        if requested_model is not None:
            if not model.matches(requested_model):
                return False

        requested_tier = normalize_tier(request.preferred_tier)

        if requested_tier is not None:
            if model.tier.value.lower() != requested_tier:
                return False

        if request.min_quality is not None:
            quality = model.quality_score or 0.0

            if quality < request.min_quality:
                return False

        if request.max_latency_ms is not None:
            latency = model.latency_ms

            if latency is None or latency > request.max_latency_ms:
                return False

        if request.max_cost is not None:
            total_cost = (
                model.pricing.input_per_1m_tokens
                + model.pricing.output_per_1m_tokens
            )

            if total_cost > request.max_cost:
                return False

        required = {
            capability.strip().lower()
            for capability in request.required_capabilities
        }

        if required:
            available = set(
                ModelRegistryCatalog._capabilities(model)
            )

            if not required.issubset(available):
                return False

        if request.stream and not model.capabilities.streaming:
            return False

        return True

    async def candidates(
        self,
        request: RoutingRequest,
    ) -> list[ModelCandidate]:
        models = self.registry.list_models()

        return [
            self._to_candidate(model)
            for model in models
            if self._matches_request(model, request)
        ]


__all__ = [
    "ModelRegistryCatalog",
]
