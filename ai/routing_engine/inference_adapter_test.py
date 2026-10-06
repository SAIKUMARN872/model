from __future__ import annotations

import asyncio

from ai.inference_engine.backends.transformers import (
    TransformersBackend,
)
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
from ai.providers.base.response import (
    ChatResponse,
    ChatUsage,
)
from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.inference_adapter import (
    RoutingInferenceAdapter,
)
from ai.routing_engine.models import RoutingRequest


class MockSLMProvider(BaseProvider):
    name = "mock-slm"
    version = "1.0"

    def __init__(self) -> None:
        self._initialized = False
        self.chat_called = False
        self.last_model: str | None = None

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
                id="mock-slm-model",
                provider=self.name,
                tier=ProviderTier.SLM,
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
            content="routing inference response",
            usage=ChatUsage(
                input_tokens=5,
                output_tokens=7,
                total_tokens=12,
            ),
            finish_reason="stop",
            request_id=str(request.request_id),
        )


def build_registry() -> ModelRegistryEngine:
    registry = ModelRegistryEngine()

    registry.register(
        ModelRecord(
            provider="mock-slm",
            model_id="mock-slm-model",
            display_name="Mock SLM Model",
            tier=ModelTier.SLM,
            context_window=4096,
            max_output_tokens=1024,
            pricing=ModelPricing(
                input_per_1m_tokens=0.01,
                output_per_1m_tokens=0.02,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                streaming=True,
            ),
            latency_ms=50.0,
            quality_score=0.85,
        )
    )

    return registry


async def main() -> None:
    provider = MockSLMProvider()

    transformers_backend = TransformersBackend(
        providers=[provider]
    )

    inference_engine = InferenceEngine(
        backends=[transformers_backend]
    )

    registry = build_registry()

    routing_engine = RoutingEngine(
        registry=registry,
    )

    adapter = RoutingInferenceAdapter(
        routing_engine=routing_engine,
        inference_engine=inference_engine,
    )

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Explain ModelNow routing.",
            }
        ],
        objective=RoutingObjective.COST,
        preferred_tier="slm",
        metadata={
            "request_id": "7b7d6c4e-3f4a-4b7e-9c2d-1a8f5e6b7c90",
        },
    )

    decision = await adapter.route(request)

    assert decision.model_id == "mock-slm-model"
    assert decision.provider == "mock-slm"
    assert decision.tier == "slm"
    assert decision.status.value == "selected"

    inference_request = (
        adapter.to_inference_request(
            request,
            decision,
        )
    )

    assert (
        inference_request.model
        == "mock-slm-model"
    )

    assert inference_request.messages == (
        request.messages
    )

    assert inference_request.metadata[
        "routing_provider"
    ] == "mock-slm"

    await inference_engine.initialize()

    result = await adapter.infer(request)

    assert provider.chat_called
    assert provider.last_model == "mock-slm-model"

    assert result.backend == (
        InferenceBackendType.TRANSFORMERS
    )

    assert result.model == "mock-slm-model"

    assert result.content == (
        "routing inference response"
    )

    assert result.usage.input_tokens == 5
    assert result.usage.output_tokens == 7
    assert result.usage.total_tokens == 12

    quality, memory_record, feedback = (
        adapter.record_result(
            request,
            result,
            relevance=0.90,
            correctness=0.90,
            completeness=0.85,
            coherence=0.90,
        )
    )

    assert quality.score > 0.0
    assert quality.grade in {
        "excellent",
        "good",
        "acceptable",
        "poor",
        "critical",
    }

    assert memory_record.request_id == (
        "7b7d6c4e-3f4a-4b7e-9c2d-1a8f5e6b7c90"
    )

    assert memory_record.model_id == (
        "mock-slm-model"
    )

    assert memory_record.provider == "mock-slm"
    assert memory_record.tier == "slm"
    assert memory_record.quality_score == quality.score
    assert memory_record.cost == 0.0
    assert memory_record.success is True
    assert memory_record.task_type == "general"

    assert adapter.model_memory.count() == 1

    stored_memory = (
        adapter.model_memory.model_records(
            "mock-slm-model"
        )
    )

    assert len(stored_memory) == 1
    assert stored_memory[0].request_id == (
        "7b7d6c4e-3f4a-4b7e-9c2d-1a8f5e6b7c90"
    )

    assert feedback.request_id == (
        "7b7d6c4e-3f4a-4b7e-9c2d-1a8f5e6b7c90"
    )

    assert feedback.model_id == (
        "mock-slm-model"
    )

    assert feedback.provider == "mock-slm"
    assert feedback.tier == "slm"
    assert feedback.task_type == "general"
    assert feedback.quality_score == quality.score
    assert feedback.success is True

    assert adapter.feedback_store.count() == 1

    stored_feedback = (
        adapter.feedback_store.for_model(
            "mock-slm-model"
        )
    )

    assert len(stored_feedback) == 1
    assert stored_feedback[0].request_id == (
        "7b7d6c4e-3f4a-4b7e-9c2d-1a8f5e6b7c90"
    )

    (
        second_result,
        second_quality,
        second_memory,
        second_feedback,
    ) = await adapter.infer_and_record(
        request,
        relevance=0.95,
        correctness=0.95,
        completeness=0.90,
        coherence=0.95,
    )

    assert second_result.model == "mock-slm-model"
    assert second_quality.score > 0.0
    assert second_memory.model_id == "mock-slm-model"
    assert second_feedback.model_id == "mock-slm-model"

    assert adapter.model_memory.count() == 2
    assert adapter.feedback_store.count() == 2

    await inference_engine.close()

    assert not transformers_backend.initialized
    assert not provider.initialized

    print("MODEL REGISTRY: PASS")
    print("ROUTING DECISION: PASS")
    print("DECISION ? INFERENCE REQUEST: PASS")
    print("INFERENCE ENGINE EXECUTION: PASS")
    print("SLM PROVIDER EXECUTION: PASS")
    print("RESULT PROPAGATION: PASS")
    print("QUALITY EVALUATOR: PASS")
    print("MODEL MEMORY RECORDING: PASS")
    print("ROUTING FEEDBACK RECORDING: PASS")
    print("INFER ? EVALUATE ? RECORD: PASS")
    print("INFERENCE SHUTDOWN: PASS")
    print("ROUTING ? INFERENCE ? INTELLIGENCE: PASS")


if __name__ == "__main__":
    asyncio.run(main())
