from __future__ import annotations

import math

from ai.latency_engine.engine import LatencyEngine
from ai.latency_engine.exceptions import InsufficientLatencyDataError
from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import ModelRecord
from ai.routing_engine.models import ModelCandidate, RoutingRequest
from ai.routing_engine.utils import normalize_model_name, normalize_tier
from ai.routing_engine.interfaces import ModelCatalog


class ModelRegistryCatalog(ModelCatalog):
    """
    Routing catalog backed by the canonical ModelNow Model Registry.

    The Model Registry remains the single source of truth for model
    metadata. This adapter converts ModelRecord objects into routing
    candidates and enriches latency from real observations when
    historical latency data is available.
    """

    def __init__(
        self,
        registry: ModelRegistryEngine,
        latency_engine: LatencyEngine | None = None,
    ) -> None:
        self.registry = registry
        self.latency_engine = latency_engine

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

    def _latency(
        self,
        model: ModelRecord,
    ) -> tuple[float | None, dict[str, object]]:
        """
        Resolve routing latency without inventing unknown values.

        Learned historical P95 takes precedence over static registry
        latency. If there is insufficient real data, the registry
        latency is used as a fallback.
        """
        metadata: dict[str, object] = {}

        if self.latency_engine is not None:
            try:
                prediction = self.latency_engine.predict(
                    model_id=model.model_id,
                    provider=model.provider,
                )
            except InsufficientLatencyDataError:
                prediction = None

            if prediction is not None:
                metadata.update(
                    {
                        "latency_source": "learned_p95",
                        "latency_samples": prediction.samples,
                        "latency_confidence": prediction.confidence,
                        "latency_prediction_method": prediction.metadata.get(
                            "prediction_method"
                        ),
                    }
                )

                return (
                    prediction.predicted_latency_ms,
                    metadata,
                )

        if model.latency_ms is not None:
            metadata["latency_source"] = "registry"
            return model.latency_ms, metadata

        metadata["latency_source"] = "unknown"
        return None, metadata

    def _to_candidate(
        self,
        model: ModelRecord,
    ) -> ModelCandidate:
        latency_ms, latency_metadata = self._latency(model)

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
            estimated_latency_ms=latency_ms,
            capabilities=self._capabilities(model),
            enabled=model.enabled,
            metadata={
                "qualified_id": model.qualified_id,
                "display_name": model.display_name,
                "context_window": model.context_window,
                "max_output_tokens": model.max_output_tokens,
                "aliases": model.aliases,
                "available": model.available,
                "version": model.version,
                **latency_metadata,
                **model.metadata,
            },
        )

    def _matches_request(
        self,
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
            latency, _ = self._latency(model)
            if latency is None or latency > request.max_latency_ms:
                return False
        if request.max_cost is not None:
            # Only a user-specified budget is a hard cost constraint.
            # Inferred policy budgets remain selector preferences.
            explicit_budget = request.metadata.get(
                "explicit_max_cost",
                request.max_cost is not None,
            )

            if explicit_budget is True:
                budget = request.max_cost
                input_tokens = request.metadata.get(
                    "estimated_input_tokens"
                )
                output_tokens = request.metadata.get(
                    "estimated_output_tokens"
                )

                # Fail closed when an explicit budget cannot be evaluated.
                if (
                    isinstance(budget, bool)
                    or not isinstance(budget, (int, float))
                    or not math.isfinite(budget)
                    or budget < 0
                ):
                    return False

                if (
                    isinstance(input_tokens, bool)
                    or not isinstance(input_tokens, int)
                    or input_tokens < 0
                    or isinstance(output_tokens, bool)
                    or not isinstance(output_tokens, int)
                    or output_tokens < 0
                ):
                    return False

                input_rate = model.pricing.input_per_1m_tokens
                output_rate = model.pricing.output_per_1m_tokens

                if (
                    isinstance(input_rate, bool)
                    or not isinstance(input_rate, (int, float))
                    or not math.isfinite(input_rate)
                    or input_rate < 0
                    or isinstance(output_rate, bool)
                    or not isinstance(output_rate, (int, float))
                    or not math.isfinite(output_rate)
                    or output_rate < 0
                ):
                    return False

                estimated_cost = (
                    input_tokens * input_rate
                    + output_tokens * output_rate
                ) / 1_000_000

                if estimated_cost > budget:
                    return False

        required = {
            capability.strip().lower()
            for capability in request.required_capabilities
        }

        if required:
            available = set(
                self._capabilities(model)
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
