from __future__ import annotations

import asyncio
from decimal import Decimal

from ai.cost_engine.engine import CostEngine
from ai.cost_engine.models import CostRequest, TokenUsage
from ai.cost_engine.pricing_provider import ModelRegistryPricingProvider
from ai.inference_engine.backends.transformers import TransformersBackend
from ai.inference_engine.engine import InferenceEngine
from ai.inference_engine.models import InferenceBackendType
from ai.latency_engine.engine import LatencyEngine
from ai.latency_engine.models import LatencyObservation
from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ai.optimization_engine.inference_adapter import (
    OptimizationInferenceAdapter,
)
from ai.providers.base.models import (
    ModelInfo,
    ProviderHealth,
    ProviderStatus,
    ProviderTier,
)
from ai.providers.base.provider import BaseProvider
from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage
from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.models import RoutingRequest


class MockProvider(BaseProvider):
    def __init__(
        self,
        name: str,
        model_id: str,
        tier: ProviderTier,
    ) -> None:
        self.name = name
        self.version = "1.0"
        self.model_id = model_id
        self.tier = tier
        self._initialized = False
        self.chat_called = False
        self.last_model: str | None = None

    @property
    def initialized(self) -> bool:
        return self._initialized

    async def initialize(self) -> None:
        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        return ProviderHealth(
            healthy=True,
            provider=self.name,
            status=ProviderStatus.READY,
            latency_ms=0.0,
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id=self.model_id,
                provider=self.name,
                tier=self.tier,
            )
        ]

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.chat_called = True
        self.last_model = request.model

        return ChatResponse(
            provider=self.name,
            model=request.model,
            content=f"response from {self.name}",
            usage=ChatUsage(
                input_tokens=100,
                output_tokens=50,
                total_tokens=150,
            ),
            finish_reason="stop",
            request_id=str(request.request_id),
        )


def build_registry() -> ModelRegistryEngine:
    registry = ModelRegistryEngine()

    registry.register_many(
        [
            ModelRecord(
                provider="provider-cheap",
                model_id="model-cheap",
                display_name="Cheap Model",
                tier=ModelTier.MLM,
                context_window=8192,
                max_output_tokens=2048,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.002,
                    output_per_1m_tokens=0.003,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    streaming=True,
                ),
                latency_ms=300.0,
                quality_score=0.82,
            ),
            ModelRecord(
                provider="provider-fast",
                model_id="model-fast",
                display_name="Fast Model",
                tier=ModelTier.MLM,
                context_window=8192,
                max_output_tokens=2048,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.006,
                    output_per_1m_tokens=0.008,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    streaming=True,
                ),
                latency_ms=300.0,
                quality_score=0.86,
            ),
            ModelRecord(
                provider="provider-quality",
                model_id="model-quality",
                display_name="Quality Model",
                tier=ModelTier.MLM,
                context_window=16384,
                max_output_tokens=4096,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.015,
                    output_per_1m_tokens=0.020,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    streaming=True,
                    reasoning=True,
                ),
                latency_ms=300.0,
                quality_score=0.96,
            ),
        ]
    )

    return registry


def build_latency_engine() -> LatencyEngine:
    latency_engine = LatencyEngine(
        max_records=100,
        min_samples=3,
    )

    latency_engine.record_many(
        [
            LatencyObservation(
                request_id="cheap-001",
                model_id="model-cheap",
                provider="provider-cheap",
                tier="mlm",
                total_latency_ms=220.0,
            ),
            LatencyObservation(
                request_id="cheap-002",
                model_id="model-cheap",
                provider="provider-cheap",
                tier="mlm",
                total_latency_ms=240.0,
            ),
            LatencyObservation(
                request_id="cheap-003",
                model_id="model-cheap",
                provider="provider-cheap",
                tier="mlm",
                total_latency_ms=260.0,
            ),
            LatencyObservation(
                request_id="fast-001",
                model_id="model-fast",
                provider="provider-fast",
                tier="mlm",
                total_latency_ms=70.0,
            ),
            LatencyObservation(
                request_id="fast-002",
                model_id="model-fast",
                provider="provider-fast",
                tier="mlm",
                total_latency_ms=80.0,
            ),
            LatencyObservation(
                request_id="fast-003",
                model_id="model-fast",
                provider="provider-fast",
                tier="mlm",
                total_latency_ms=90.0,
            ),
            LatencyObservation(
                request_id="quality-001",
                model_id="model-quality",
                provider="provider-quality",
                tier="mlm",
                total_latency_ms=400.0,
            ),
            LatencyObservation(
                request_id="quality-002",
                model_id="model-quality",
                provider="provider-quality",
                tier="mlm",
                total_latency_ms=420.0,
            ),
            LatencyObservation(
                request_id="quality-003",
                model_id="model-quality",
                provider="provider-quality",
                tier="mlm",
                total_latency_ms=440.0,
            ),
        ]
    )

    return latency_engine
def build_inference_engine() -> tuple[
    InferenceEngine,
    list[MockProvider],
]:
    providers = [
        MockProvider(
            "provider-cheap",
            "model-cheap",
            ProviderTier.MLM,
        ),
        MockProvider(
            "provider-fast",
            "model-fast",
            ProviderTier.MLM,
        ),
        MockProvider(
            "provider-quality",
            "model-quality",
            ProviderTier.MLM,
        ),
    ]

    backend = TransformersBackend(
        providers=providers,
    )

    engine = InferenceEngine(
        backends=[backend],
    )

    return engine, providers


async def main() -> None:
    print("=" * 100)
    print("MODELNOW COST + LATENCY + OPTIMIZATION INTEGRATION TEST")
    print("=" * 100)

    registry = build_registry()
    latency_engine = build_latency_engine()

    assert registry.count() == 3
    assert latency_engine.count == 9

    print()
    print("TEST 1 - MODEL REGISTRY: PASS")
    print(f"  Registered models: {registry.count()}")

    cheap_prediction = latency_engine.predict(
        model_id="model-cheap",
        provider="provider-cheap",
    )

    fast_prediction = latency_engine.predict(
        model_id="model-fast",
        provider="provider-fast",
    )

    quality_prediction = latency_engine.predict(
        model_id="model-quality",
        provider="provider-quality",
    )

    assert cheap_prediction.predicted_latency_ms == 258.0
    assert fast_prediction.predicted_latency_ms == 89.0
    assert quality_prediction.predicted_latency_ms == 438.0

    print("TEST 2 - LEARNED LATENCY PREDICTIONS: PASS")
    print(
        f"  model-cheap    P95={cheap_prediction.predicted_latency_ms:.2f} ms"
    )
    print(
        f"  model-fast     P95={fast_prediction.predicted_latency_ms:.2f} ms"
    )
    print(
        f"  model-quality  P95={quality_prediction.predicted_latency_ms:.2f} ms"
    )

    routing_engine = RoutingEngine(
        registry=registry,
        latency_engine=latency_engine,
    )

    routing_request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Explain how ModelNow optimizes model selection.",
            }
        ],
        objective=RoutingObjective.BALANCED,
        preferred_tier="mlm",
        metadata={
            "request_id": "550e8400-e29b-41d4-a716-446655440000",
        },
    )

    candidates = await routing_engine.get_candidates(
        routing_request
    )

    assert len(candidates) == 3

    candidate_by_model = {
        candidate.model_id: candidate
        for candidate in candidates
    }

    assert (
        candidate_by_model["model-cheap"].estimated_latency_ms
        == 258.0
    )
    assert (
        candidate_by_model["model-fast"].estimated_latency_ms
        == 89.0
    )
    assert (
        candidate_by_model["model-quality"].estimated_latency_ms
        == 438.0
    )

    print("TEST 3 - ROUTING USES LEARNED LATENCY: PASS")

    for candidate in candidates:
        print(
            f"  {candidate.model_id:<15} "
            f"provider={candidate.provider:<18} "
            f"cost={candidate.input_cost + candidate.output_cost:.4f} "
            f"latency={candidate.estimated_latency_ms:.2f} ms "
            f"quality={candidate.quality:.2f}"
        )

    inference_engine, providers = build_inference_engine()

    adapter = OptimizationInferenceAdapter(
        routing_engine=routing_engine,
        inference_engine=inference_engine,
    )

    await inference_engine.initialize()

    result, inference_request, inference_result = (
        await adapter.optimize_and_infer(
            routing_request
        )
    )

    assert result.decision.selected_model is not None
    assert result.decision.selected_provider is not None

    assert inference_request.model == (
        result.decision.selected_model
    )
    assert inference_request.provider == (
        result.decision.selected_provider
    )

    print("TEST 4 - ROUTING -> OPTIMIZATION: PASS")
    print(
        f"  selected_model={result.decision.selected_model}"
    )
    print(
        f"  selected_provider={result.decision.selected_provider}"
    )
    print(
        f"  selected_latency={result.optimized_latency_ms} ms"
    )
    print(
        f"  selected_quality={result.optimized_quality}"
    )

    assert inference_result.status.value == "completed"
    assert inference_result.backend == (
        InferenceBackendType.TRANSFORMERS
    )
    assert inference_result.model == (
        result.decision.selected_model
    )
    assert inference_result.usage.total_tokens == 150

    selected_provider = next(
        provider
        for provider in providers
        if provider.name
        == result.decision.selected_provider
    )

    assert selected_provider.chat_called
    assert selected_provider.last_model == (
        result.decision.selected_model
    )

    print("TEST 5 - OPTIMIZATION -> INFERENCE: PASS")
    print(
        f"  executed_model={inference_result.model}"
    )
    print(
        f"  executed_provider={selected_provider.name}"
    )
    print(
        f"  total_tokens={inference_result.usage.total_tokens}"
    )

    pricing_provider = ModelRegistryPricingProvider(
        registry
    )

    cost_engine = CostEngine(
        pricing_provider=pricing_provider
    )

    usage = TokenUsage(
        input_tokens=inference_result.usage.input_tokens,
        output_tokens=inference_result.usage.output_tokens,
    )

    cost_request = CostRequest(
        model=inference_result.model,
        provider=selected_provider.name,
        usage=usage,
        request_id=inference_result.request_id,
        metadata={
            "source": "optimization_inference_integration_test",
        },
    )

    cost_result = cost_engine.calculate_cost(
        cost_request
    )

    assert cost_result.model == (
        result.decision.selected_model
    )
    assert cost_result.provider == (
        result.decision.selected_provider
    )
    assert cost_result.input_tokens == 100
    assert cost_result.output_tokens == 50
    assert cost_result.total_tokens == 150
    assert cost_result.total_cost == Decimal("0.00000100")

    print("TEST 6 - ACTUAL INFERENCE COST: PASS")
    print(
        f"  model={cost_result.model}"
    )
    print(
        f"  provider={cost_result.provider}"
    )
    print(
        f"  input_tokens={cost_result.input_tokens}"
    )
    print(
        f"  output_tokens={cost_result.output_tokens}"
    )
    print(
        f"  actual_cost={cost_result.total_cost} "
        f"{cost_result.currency}"
    )

    await inference_engine.close()

    assert all(
        not provider.initialized
        for provider in providers
    )

    print("TEST 7 - INFERENCE SHUTDOWN: PASS")

    print()
    print("=" * 100)
    print("COST + LATENCY + OPTIMIZATION INTEGRATION: PASS")
    print("=" * 100)
    print(
        "ModelNow successfully connected model registry pricing, "
        "learned latency, routing, optimization, and inference."
    )
    print(
        "Actual inference usage is available for the Cost Engine "
        "to calculate request-level cost."
    )
    print("=" * 100)


if __name__ == "__main__":
    asyncio.run(main())









