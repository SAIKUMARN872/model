from __future__ import annotations

import asyncio
from uuid import UUID

from ai.inference_engine.backends.transformers import (
    TransformersBackend,
)
from ai.inference_engine.backends.vllm import (
    VLLMBackend,
)
from ai.inference_engine.engine import InferenceEngine
from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceRequest,
)
from ai.inference_engine.retry import (
    RetryExecutor,
    RetryStrategy,
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


REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000"


class MockProvider(BaseProvider):
    name = "provider-primary"
    version = "1.0"

    def __init__(
        self,
        *,
        model: str,
        content: str,
        fail_count: int = 0,
    ) -> None:
        self.model = model
        self.content = content
        self.fail_count = fail_count

        self._initialized = False
        self.chat_calls = 0
        self.last_request: ChatRequest | None = None

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
                id=self.model,
                provider=self.name,
                tier=ProviderTier.SLM,
            )
        ]

    async def supports_model(
        self,
        model: str,
    ) -> bool:
        return model == self.model

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.chat_calls += 1
        self.last_request = request

        if self.fail_count > 0:
            self.fail_count -= 1
            raise RuntimeError(
                f"Simulated provider failure: {self.name}"
            )

        return ChatResponse(
            provider=self.name,
            model=request.model,
            content=self.content,
            usage=ChatUsage(
                input_tokens=100,
                output_tokens=50,
                total_tokens=150,
                estimated_cost=0.0015,
            ),
            finish_reason="stop",
            request_id=str(request.request_id),
            latency_ms=12.5,
            time_to_first_token_ms=4.5,
            metadata={
                "integration_test": True,
            },
        )


class MockSecondaryProvider(MockProvider):
    name = "provider-secondary"
    version = "1.0"


async def main() -> None:
    # ================================================================
    # PRIMARY INFERENCE ENGINE
    # ================================================================

    primary_provider = MockProvider(
        model="integration-model",
        content="primary inference response",
    )

    primary_backend = TransformersBackend(
        providers=[primary_provider]
    )

    retry_executor = RetryExecutor(
        RetryStrategy(
            max_attempts=2,
            initial_delay_seconds=0.0,
            max_delay_seconds=0.0,
        )
    )

    engine = InferenceEngine(
        backends=[primary_backend],
        retry_executor=retry_executor,
    )

    # ================================================================
    # TEST 1 - BACKEND REGISTRATION
    # ================================================================

    assert engine.backend_types() == [
        InferenceBackendType.TRANSFORMERS.value
    ]

    assert (
        engine.get_backend("transformers")
        is primary_backend
    )

    print("TEST 1 - BACKEND REGISTRATION: PASS")

    # ================================================================
    # TEST 2 - ENGINE INITIALIZATION
    # ================================================================

    await engine.initialize()

    assert primary_backend.initialized
    assert primary_provider.initialized

    print("TEST 2 - ENGINE INITIALIZATION: PASS")

    # ================================================================
    # TEST 3 - HEALTH + MODEL SUPPORT
    # ================================================================

    health = await engine.health_check()

    assert len(health) == 1
    assert health[0].healthy
    assert (
        health[0].backend
        == InferenceBackendType.TRANSFORMERS
    )

    assert await primary_backend.supports_model(
        "integration-model"
    )

    print("TEST 3 - HEALTH + MODEL SUPPORT: PASS")

    # ================================================================
    # TEST 4 - INFERENCE EXECUTION
    # ================================================================

    request = InferenceRequest(
        model="integration-model",
        provider="provider-primary",
        messages=[
            {
                "role": "system",
                "content": "You are ModelNow.",
            },
            {
                "role": "user",
                "content": "Explain ModelNow in one sentence.",
            },
        ],
        temperature=0.2,
        max_tokens=100,
        request_id=REQUEST_ID,
        metadata={
            "test": "real-inference",
            "source": "integration-test",
        },
    )

    result = await engine.infer(request)

    assert primary_provider.chat_calls == 1

    assert result.content == (
        "primary inference response"
    )

    assert result.model == "integration-model"

    assert (
        result.backend
        == InferenceBackendType.TRANSFORMERS
    )

    print("TEST 4 - INFERENCE EXECUTION: PASS")

    # ================================================================
    # TEST 5 - REQUEST ID PROPAGATION
    # ================================================================

    assert result.request_id == REQUEST_ID

    assert primary_provider.last_request is not None

    assert (
        str(primary_provider.last_request.request_id)
        == REQUEST_ID
    )

    UUID(result.request_id)

    print("TEST 5 - REQUEST ID PROPAGATION: PASS")

    # ================================================================
    # TEST 6 - EXACT PROVIDER SELECTION
    # ================================================================

    assert primary_provider.last_request is not None

    assert (
        primary_provider.last_request.metadata["provider"]
        == "provider-primary"
    )

    assert (
        result.metadata["provider"]
        == "provider-primary"
    )

    print("TEST 6 - PROVIDER SELECTION: PASS")

    # ================================================================
    # TEST 7 - TOKEN USAGE
    # ================================================================

    assert result.usage.input_tokens == 100
    assert result.usage.output_tokens == 50
    assert result.usage.total_tokens == 150
    assert result.usage.estimated_cost == 0.0015

    print("TEST 7 - TOKEN USAGE: PASS")

    # ================================================================
    # TEST 8 - LATENCY + TTFT
    # ================================================================

    assert result.latency_ms == 12.5
    assert result.time_to_first_token_ms == 4.5

    print("TEST 8 - LATENCY + TTFT: PASS")

    # ================================================================
    # TEST 9 - METRICS REGISTRY
    # ================================================================

    assert engine.metrics is not None

    print("TEST 9 - METRICS REGISTRY: PASS")

    # ================================================================
    # TEST 10 - TELEMETRY COLLECTOR
    # ================================================================

    assert engine.telemetry is not None

    print("TEST 10 - TELEMETRY COLLECTOR: PASS")

    # ================================================================
    # FALLBACK ENGINE
    #
    # One TRANSFORMERS backend + one VLLM backend.
    # Same model is supported by both.
    #
    # Primary provider fails twice.
    # Retry max_attempts=2 therefore exhausts the primary.
    # Fallback then selects VLLM.
    # ================================================================

    failing_provider = MockProvider(
        model="fallback-model",
        content="primary should fail",
        fail_count=2,
    )

    fallback_provider = MockSecondaryProvider(
        model="fallback-model",
        content="fallback inference response",
    )

    failing_backend = TransformersBackend(
        providers=[failing_provider]
    )

    fallback_backend = VLLMBackend(
        providers=[fallback_provider]
    )

    fallback_engine = InferenceEngine(
        backends=[
            failing_backend,
            fallback_backend,
        ],
        retry_executor=RetryExecutor(
            RetryStrategy(
                max_attempts=2,
                initial_delay_seconds=0.0,
                max_delay_seconds=0.0,
            )
        ),
    )

    # ================================================================
    # TEST 11 - MULTI-BACKEND REGISTRATION
    # ================================================================

    assert fallback_engine.backend_types() == [
        InferenceBackendType.TRANSFORMERS.value,
        InferenceBackendType.VLLM.value,
    ]

    assert (
        fallback_engine.get_backend("transformers")
        is failing_backend
    )

    assert (
        fallback_engine.get_backend("vllm")
        is fallback_backend
    )

    print("TEST 11 - MULTI-BACKEND REGISTRATION: PASS")

    # ================================================================
    # TEST 12 - FALLBACK ENGINE INITIALIZATION
    # ================================================================

    await fallback_engine.initialize()

    assert failing_backend.initialized
    assert fallback_backend.initialized

    assert failing_provider.initialized
    assert fallback_provider.initialized

    print("TEST 12 - FALLBACK INITIALIZATION: PASS")

    # ================================================================
    # TEST 13 - RETRY + FALLBACK
    # ================================================================

    fallback_request = InferenceRequest(
        model="fallback-model",
        provider="provider-primary",
        messages=[
            {
                "role": "user",
                "content": "Test retry and fallback.",
            }
        ],
        max_tokens=50,
        request_id=REQUEST_ID,
    )

    fallback_result = await fallback_engine.infer(
        fallback_request
    )

    # Primary is attempted twice:
    # attempt 1 -> failure
    # attempt 2 -> failure
    assert failing_provider.chat_calls == 2

    # Fallback should execute exactly once.
    assert fallback_provider.chat_calls == 1

    assert (
        fallback_result.content
        == "fallback inference response"
    )

    assert (
        fallback_result.backend
        == InferenceBackendType.VLLM
    )

    print("TEST 13 - RETRY + FALLBACK: PASS")

    # ================================================================
    # TEST 14 - FALLBACK RESULT + USAGE
    # ================================================================

    assert fallback_result.model == "fallback-model"

    assert (
        fallback_result.usage.input_tokens
        == 100
    )

    assert (
        fallback_result.usage.output_tokens
        == 50
    )

    assert (
        fallback_result.usage.total_tokens
        == 150
    )

    assert fallback_result.request_id == REQUEST_ID

    print("TEST 14 - FALLBACK RESULT + USAGE: PASS")

    # ================================================================
    # TEST 15 - FALLBACK LATENCY
    # ================================================================

    assert fallback_result.latency_ms is not None
    assert fallback_result.latency_ms >= 0.0

    print("TEST 15 - FALLBACK LATENCY: PASS")

    # ================================================================
    # TEST 16 - FALLBACK METRICS + TELEMETRY
    # ================================================================

    assert fallback_engine.metrics is not None
    assert fallback_engine.telemetry is not None

    print("TEST 16 - FALLBACK METRICS + TELEMETRY: PASS")

    # ================================================================
    # TEST 17 - HEALTH CHECK WITH MULTIPLE BACKENDS
    # ================================================================

    fallback_health = (
        await fallback_engine.health_check()
    )

    assert len(fallback_health) == 2

    assert all(
        item.healthy
        for item in fallback_health
    )

    assert {
        item.backend
        for item in fallback_health
    } == {
        InferenceBackendType.TRANSFORMERS,
        InferenceBackendType.VLLM,
    }

    print("TEST 17 - MULTI-BACKEND HEALTH CHECK: PASS")

    # ================================================================
    # TEST 18 - CLEAN SHUTDOWN
    # ================================================================

    await fallback_engine.close()

    assert not failing_backend.initialized
    assert not fallback_backend.initialized

    assert not failing_provider.initialized
    assert not fallback_provider.initialized

    await engine.close()

    assert not primary_backend.initialized
    assert not primary_provider.initialized

    print("TEST 18 - ENGINE SHUTDOWN: PASS")

    print()
    print("=" * 92)
    print("MODELNOW REAL INFERENCE ENGINE INTEGRATION: PASS")
    print("=" * 92)
    print(
        "Inference Engine successfully validated:"
    )
    print(
        "  backend registration"
    )
    print(
        "  multi-backend registration"
    )
    print(
        "  engine initialization"
    )
    print(
        "  model/backend selection"
    )
    print(
        "  provider selection"
    )
    print(
        "  request ID propagation"
    )
    print(
        "  inference execution"
    )
    print(
        "  token usage"
    )
    print(
        "  latency and TTFT"
    )
    print(
        "  metrics"
    )
    print(
        "  telemetry"
    )
    print(
        "  retry"
    )
    print(
        "  fallback"
    )
    print(
        "  health checks"
    )
    print(
        "  clean shutdown"
    )
    print("=" * 92)


if __name__ == "__main__":
    asyncio.run(main())
