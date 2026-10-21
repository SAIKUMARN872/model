from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator

from ai.inference_engine.backends.vllm import (
    VLLMBackend,
    VLLMClient,
    VLLMConfig,
)
from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceHealth,
    InferenceRequest,
    InferenceResult,
)
from ai.providers.base.config import ProviderConfig
from ai.providers.base.models import (
    ModelCapability,
    ModelInfo,
    ProviderHealth,
)
from ai.providers.base.provider import BaseProvider
from ai.providers.base.request import ChatRequest
from ai.providers.base.response import (
    ChatResponse,
    ChatUsage,
    StreamChunk,
)


class MockVLLMProvider(BaseProvider):
    name = "mock-vllm"
    version = "1.0"

    def __init__(self) -> None:
        super().__init__(
            ProviderConfig(
                provider_id="mock-vllm"
            )
        )

    async def initialize(self) -> None:
        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        return ProviderHealth(
            provider_id=self.config.provider_id,
            status="ready",
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id="mock-vllm-model",
                provider="mock-vllm",
                capabilities=frozenset(
                    {
                        ModelCapability.CHAT,
                        ModelCapability.STREAMING,
                    }
                ),
                enabled=True,
            )
        ]

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        return ChatResponse(
            provider=self.name,
            model=request.model,
            content="vLLM mock response",
            usage=ChatUsage(
                input_tokens=5,
                output_tokens=4,
            ),
            finish_reason="stop",
            request_id=str(
                request.request_id
            ),
        )

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        yield StreamChunk(
            provider=self.name,
            model=request.model,
            content="vLLM ",
            request_id=str(
                request.request_id
            ),
        )

        yield StreamChunk(
            provider=self.name,
            model=request.model,
            content="stream",
            request_id=str(
                request.request_id
            ),
            finish_reason="stop",
        )


async def main() -> None:
    provider = MockVLLMProvider()

    client = VLLMClient([provider])

    await provider.initialize()

    request = InferenceRequest(
        model="mock-vllm-model",
        messages=[
            {
                "role": "user",
                "content": "Hello",
            }
        ],
    )

    assert await provider.supports_model(
        "mock-vllm-model"
    )
    print("MODEL SUPPORT: PASS")

    result = await client.infer(request)

    assert result.backend == (
        InferenceBackendType.VLLM
    )
    assert result.content == (
        "vLLM mock response"
    )
    assert result.usage.total_tokens == 9
    print("CHAT RESPONSE ADAPTER: PASS")

    stream_results = [
        result
        async for result in client.stream(
            request
        )
    ]

    assert len(stream_results) == 2
    assert "".join(
        result.content
        for result in stream_results
    ) == "vLLM stream"
    print("STREAM ADAPTER: PASS")

    backend = VLLMBackend(
        providers=[provider],
        config=VLLMConfig(),
    )

    await backend.initialize()

    assert backend.initialized
    print("BACKEND LIFECYCLE: PASS")

    health = await backend.health_check()

    assert isinstance(
        health,
        InferenceHealth,
    )
    assert health.healthy
    assert health.backend == (
        InferenceBackendType.VLLM
    )
    print("HEALTH CHECK: PASS")

    backend_result = await backend.infer(
        request
    )

    assert backend_result.backend == (
        InferenceBackendType.VLLM
    )
    print("BACKEND INFERENCE: PASS")

    backend_stream = [
        result
        async for result in backend.stream(
            request
        )
    ]

    assert len(backend_stream) == 2
    print("BACKEND STREAMING: PASS")

    await backend.close()

    assert not backend.initialized
    print("BACKEND SHUTDOWN: PASS")

    print("VLLM BACKEND TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
