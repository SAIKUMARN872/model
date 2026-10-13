from __future__ import annotations

import asyncio

from ai.inference_engine.backends.transformers import TransformersBackend
from ai.inference_engine.engine import InferenceEngine
from ai.inference_engine.models import InferenceBackendType
from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
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

from .engine import OptimizationEngine
from .inference_adapter import OptimizationInferenceAdapter


class OptimizationProvider(BaseProvider):
    """Deterministic provider used to verify real inference execution."""

    def __init__(
        self,
        *,
        name: str,
        model_id: str,
        tier: ProviderTier,
        response_text: str,
    ) -> None:
        self.name = name
        self.version = "1.0"
        self._model_id = model_id
        self._tier = tier
        self._response_text = response_text
        self._initialized = False
        self.chat_called = False

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
            latency_ms=1.0,
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id=self._model_id,
                provider=self.name,
                tier=self._tier,
            )
        ]

    async def supports_model(self, model: str) -> bool:
        return model == self._model_id

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.chat_called = True

        return ChatResponse(
            provider=self.name,
            model=request.model,
            content=self._response_text,
            usage=ChatUsage(
                input_tokens=5,
                output_tokens=4,
                total_tokens=9,
            ),
            finish_reason="stop",
            request_id=str(request.request_id),
        )


def build_registry() -> ModelRegistryEngine:
    registry = ModelRegistryEngine()

    registry.register_many(
        [
            ModelRecord(
                provider="provider-slm",
                model_id="slm-cheap",
                display_name="Cheap SLM",
                tier=ModelTier.SLM,
                context_window=4096,
                max_output_tokens=1024,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.001,
                    output_per_1m_tokens=0.001,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    streaming=True,
                ),
                latency_ms=100.0,
                quality_score=0.72,
            ),
            ModelRecord(
                provider="provider-mlm",
                model_id="mlm-fast",
                display_name="Fast MLM",
                tier=ModelTier.MLM,
                context_window=8192,
                max_output_tokens=2048,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.004,
                    output_per_1m_tokens=0.004,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    reasoning=True,
                    streaming=True,
                ),
                latency_ms=50.0,
                quality_score=0.88,
            ),
            ModelRecord(
                provider="provider-llm",
                model_id="llm-quality",
                display_name="Quality LLM",
                tier=ModelTier.LLM,
                context_window=32768,
                max_output_tokens=4096,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.020,
                    output_per_1m_tokens=0.020,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    reasoning=True,
                    tool_use=True,
                    streaming=True,
                    long_context=True,
                    agentic=True,
                ),
                latency_ms=300.0,
                quality_score=0.97,
            ),
        ]
    )

    return registry


def build_providers() -> list[OptimizationProvider]:
    return [
        OptimizationProvider(
            name="provider-slm",
            model_id="slm-cheap",
            tier=ProviderTier.SLM,
            response_text="SLM optimized response",
        ),
        OptimizationProvider(
            name="provider-mlm",
            model_id="mlm-fast",
            tier=ProviderTier.MLM,
            response_text="MLM optimized response",
        ),
        OptimizationProvider(
            name="provider-llm",
            model_id="llm-quality",
            tier=ProviderTier.LLM,
            response_text="LLM optimized response",
        ),
    ]


async def main() -> None:
    registry = build_registry()
    providers = build_providers()

    backend = TransformersBackend(
        providers=providers,
    )

    inference_engine = InferenceEngine(
        backends=[backend],
    )

    routing_engine = RoutingEngine(
        registry=registry,
    )

    optimization_engine = OptimizationEngine()

    adapter = OptimizationInferenceAdapter(
        routing_engine=routing_engine,
        optimization_engine=optimization_engine,
        inference_engine=inference_engine,
    )

    await inference_engine.initialize()

    print("=" * 100)
    print("MODELNOW OPTIMIZATION -> INFERENCE INTEGRATION TEST")
    print("=" * 100)

    messages = [
        {
            "role": "user",
            "content": "Explain how ModelNow optimizes AI execution.",
        }
    ]

    cost_request = RoutingRequest(
        messages=messages,
        objective=RoutingObjective.COST,
        metadata={
            "request_id": "00000000-0000-0000-0000-000000000001",
        },
    )

    cost_result = await adapter.optimize(
        cost_request
    )

    assert (
        cost_result.decision.selected_model
        == "slm-cheap"
    )

    assert (
        cost_result.decision.selected_provider
        == "provider-slm"
    )

    print("COST OPTIMIZATION: PASS")
    print(
        f"  selected={cost_result.decision.selected_model}"
    )

    speed_request = RoutingRequest(
        messages=messages,
        objective=RoutingObjective.LATENCY,
        metadata={
            "request_id": "00000000-0000-0000-0000-000000000002",
        },
    )

    speed_result = await adapter.optimize(
        speed_request
    )

    assert (
        speed_result.decision.selected_model
        == "mlm-fast"
    )

    assert (
        speed_result.decision.selected_provider
        == "provider-mlm"
    )

    print("SPEED OPTIMIZATION: PASS")
    print(
        f"  selected={speed_result.decision.selected_model}"
    )

    quality_request = RoutingRequest(
        messages=messages,
        objective=RoutingObjective.QUALITY,
        metadata={
            "request_id": "00000000-0000-0000-0000-000000000003",
        },
    )

    quality_result = await adapter.optimize(
        quality_request
    )

    assert (
        quality_result.decision.selected_model
        == "llm-quality"
    )

    assert (
        quality_result.decision.selected_provider
        == "provider-llm"
    )

    print("QUALITY OPTIMIZATION: PASS")
    print(
        f"  selected={quality_result.decision.selected_model}"
    )

    real_request = RoutingRequest(
        messages=messages,
        objective=RoutingObjective.COST,
        metadata={
            "request_id": "00000000-0000-0000-0000-000000000004",
        },
    )

    (
        optimization_result,
        optimized_inference_request,
        inference_result,
    ) = await adapter.optimize_and_infer(
        real_request
    )

    assert (
        optimization_result.decision.selected_model
        == "slm-cheap"
    )

    assert (
        optimized_inference_request.model
        == "slm-cheap"
    )

    assert (
        optimized_inference_request.metadata[
            "optimization_provider"
        ]
        == "provider-slm"
    )

    assert (
        inference_result.backend
        == InferenceBackendType.TRANSFORMERS
    )

    assert (
        inference_result.model
        == "slm-cheap"
    )

    assert (
        inference_result.content
        == "SLM optimized response"
    )

    assert (
        inference_result.usage.input_tokens
        == 5
    )

    assert (
        inference_result.usage.output_tokens
        == 4
    )

    assert (
        inference_result.usage.total_tokens
        == 9
    )

    assert providers[0].chat_called
    assert not providers[1].chat_called
    assert not providers[2].chat_called

    print(
        "OPTIMIZED INFERENCE REQUEST: PASS"
    )

    print(
        "TRANSFORMERS INFERENCE EXECUTION: PASS"
    )

    print(
        "SELECTED PROVIDER EXECUTION: PASS"
    )

    print(
        "RESULT PROPAGATION: PASS"
    )

    await inference_engine.close()

    assert not backend.initialized
    assert not providers[0].initialized
    assert not providers[1].initialized
    assert not providers[2].initialized

    print("INFERENCE SHUTDOWN: PASS")

    print("=" * 100)
    print("OPTIMIZATION -> INFERENCE: PASS")
    print("=" * 100)


async def test_selected_provider_is_enforced() -> None:
    registry = ModelRegistryEngine()

    registry.register_many(
        [
            ModelRecord(
                provider="provider-expensive",
                model_id="shared-model",
                display_name="Shared Model",
                tier=ModelTier.MLM,
                context_window=8192,
                max_output_tokens=2048,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.010,
                    output_per_1m_tokens=0.010,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    streaming=True,
                ),
                latency_ms=50.0,
                quality_score=0.90,
            ),
            ModelRecord(
                provider="provider-cheap",
                model_id="shared-model",
                display_name="Shared Model",
                tier=ModelTier.MLM,
                context_window=8192,
                max_output_tokens=2048,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.001,
                    output_per_1m_tokens=0.001,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    streaming=True,
                ),
                latency_ms=50.0,
                quality_score=0.90,
            ),
        ]
    )

    expensive_provider = OptimizationProvider(
        name="provider-expensive",
        model_id="shared-model",
        tier=ProviderTier.MLM,
        response_text="EXPENSIVE PROVIDER RESPONSE",
    )

    cheap_provider = OptimizationProvider(
        name="provider-cheap",
        model_id="shared-model",
        tier=ProviderTier.MLM,
        response_text="CHEAP PROVIDER RESPONSE",
    )

    backend = TransformersBackend(
        providers=[
            expensive_provider,
            cheap_provider,
        ],
    )

    inference_engine = InferenceEngine(
        backends=[backend],
    )

    routing_engine = RoutingEngine(
        registry=registry,
    )

    optimization_engine = OptimizationEngine()

    adapter = OptimizationInferenceAdapter(
        routing_engine=routing_engine,
        optimization_engine=optimization_engine,
        inference_engine=inference_engine,
    )

    await inference_engine.initialize()

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Test exact provider execution.",
            }
        ],
        objective=RoutingObjective.COST,
        metadata={
            "request_id": (
                "00000000-0000-0000-0000-000000000005"
            ),
        },
    )

    (
        optimization_result,
        inference_request,
        inference_result,
    ) = await adapter.optimize_and_infer(request)

    assert (
        optimization_result.decision.selected_model
        == "shared-model"
    )

    assert (
        optimization_result.decision.selected_provider
        == "provider-cheap"
    )

    assert inference_request.model == "shared-model"

    assert (
        inference_request.provider
        == "provider-cheap"
    )

    assert (
        inference_request.metadata[
            "optimization_provider"
        ]
        == "provider-cheap"
    )

    assert (
        inference_result.content
        == "CHEAP PROVIDER RESPONSE"
    )

    assert cheap_provider.chat_called
    assert not expensive_provider.chat_called

    await inference_engine.close()

    assert not backend.initialized
    assert not cheap_provider.initialized
    assert not expensive_provider.initialized

    print("EXACT PROVIDER ENFORCEMENT: PASS")
    print(
        "  selected_provider=provider-cheap"
    )
    print(
        "  executed_provider=provider-cheap"
    )


async def run_all_tests() -> None:
    await main()
    await test_selected_provider_is_enforced()


if __name__ == "__main__":
    asyncio.run(run_all_tests())
