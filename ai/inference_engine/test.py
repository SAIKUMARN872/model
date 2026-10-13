from __future__ import annotations

import asyncio

from ai.inference_engine.backends.transformers import (
    TransformersBackend,
)
from ai.inference_engine.engine import InferenceEngine
from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceRequest,
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


class MockProvider(BaseProvider):
    name = "mock"
    version = "1.0"

    def __init__(self) -> None:
        self._initialized = False
        self.chat_called = False

    async def initialize(self) -> None:
        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        return ProviderHealth(
            healthy=True,
            provider="mock",
            status=ProviderStatus.READY,
            latency_ms=0.0,
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id="mock-model",
                provider="mock",
                tier=ProviderTier.SLM,
            )
        ]

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.chat_called = True

        return ChatResponse(
            provider="mock",
            model=request.model,
            content="inference engine response",
            usage=ChatUsage(
                input_tokens=4,
                output_tokens=6,
                total_tokens=10,
            ),
            finish_reason="stop",
            request_id=str(request.request_id),
        )


async def main() -> None:
    provider = MockProvider()

    transformers_backend = TransformersBackend(
        providers=[provider]
    )

    engine = InferenceEngine(
        backends=[transformers_backend]
    )

    assert engine.backend_types() == [
        InferenceBackendType.TRANSFORMERS.value
    ]

    await engine.initialize()

    assert provider.initialized
    assert transformers_backend.initialized

    request = InferenceRequest(
        model="mock-model",
        messages=[
            {
                "role": "user",
                "content": "Hello ModelNow",
            }
        ],
        temperature=0.2,
        max_tokens=50,
    )

    result = await engine.infer(request)

    assert provider.chat_called

    assert result.backend == (
        InferenceBackendType.TRANSFORMERS
    )

    assert result.model == "mock-model"

    assert result.content == (
        "inference engine response"
    )

    assert result.usage.input_tokens == 4
    assert result.usage.output_tokens == 6
    assert result.usage.total_tokens == 10

    backend = engine.get_backend("transformers")

    assert backend is transformers_backend

    supported = await transformers_backend.supports_model(
        "mock-model"
    )

    assert supported

    health = await engine.health_check()

    assert len(health) == 1
    assert health[0].healthy
    assert (
        health[0].backend
        == InferenceBackendType.TRANSFORMERS
    )

    await engine.close()

    assert not transformers_backend.initialized
    assert not provider.initialized

    print("ENGINE REGISTRATION: PASS")
    print("BACKEND SELECTION: PASS")
    print("ENGINE INITIALIZATION: PASS")
    print("INFERENCE EXECUTION: PASS")
    print("RESULT PROPAGATION: PASS")
    print("HEALTH CHECK: PASS")
    print("ENGINE SHUTDOWN: PASS")
    print("INFERENCE ENGINE INTEGRATION TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())