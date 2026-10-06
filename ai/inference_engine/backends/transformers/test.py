from __future__ import annotations

import asyncio

from ai.inference_engine.backends.transformers import (
    TransformersBackend,
)
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
    StreamChunk,
)


class MockProvider(BaseProvider):
    name = "mock"
    version = "1.0"

    def __init__(self) -> None:
        self._initialized = False
        self.chat_called = False
        self.stream_called = False

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
            content="mock response",
            usage=ChatUsage(
                input_tokens=5,
                output_tokens=3,
                total_tokens=8,
            ),
            finish_reason="stop",
            request_id=str(request.request_id),
        )

    async def stream(
        self,
        request: ChatRequest,
    ):
        self.stream_called = True

        yield StreamChunk(
            provider="mock",
            model=request.model,
            request_id=str(request.request_id),
            content="hello",
            done=False,
        )

        yield StreamChunk(
            provider="mock",
            model=request.model,
            request_id=str(request.request_id),
            content=" world",
            usage=ChatUsage(
                input_tokens=5,
                output_tokens=2,
                total_tokens=7,
            ),
            finish_reason="stop",
            done=True,
        )


async def main() -> None:
    provider = MockProvider()

    backend = TransformersBackend(
        providers=[provider]
    )

    assert backend.backend_type == (
        InferenceBackendType.TRANSFORMERS
    )

    await backend.initialize()

    assert backend.initialized
    assert provider.initialized

    supported = await backend.supports_model(
        "mock-model"
    )

    assert supported

    request = InferenceRequest(
        model="mock-model",
        messages=[
            {
                "role": "user",
                "content": "Hello",
            }
        ],
        temperature=0.2,
        max_tokens=20,
    )

    result = await backend.infer(request)

    assert provider.chat_called
    assert result.backend == (
        InferenceBackendType.TRANSFORMERS
    )
    assert result.model == "mock-model"
    assert result.content == "mock response"
    assert result.usage.input_tokens == 5
    assert result.usage.output_tokens == 3
    assert result.usage.total_tokens == 8

    stream_results = []

    stream_request = InferenceRequest(
        model=request.model,
        messages=list(request.messages),
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        top_p=request.top_p,
        stream=True,
        tools=list(request.tools or []),
        response_format=(
            dict(request.response_format)
            if request.response_format
            else None
        ),
        stop=(
            list(request.stop)
            if isinstance(request.stop, list)
            else request.stop
        ),
        seed=request.seed,
        request_id=request.request_id,
        metadata=dict(request.metadata),
    )

    async for result in backend.stream(
        stream_request
    ):
        stream_results.append(result)

    assert provider.stream_called
    assert len(stream_results) == 2
    assert stream_results[0].content == "hello"
    assert stream_results[1].content == " world"
    assert stream_results[1].finish_reason == "stop"

    await backend.close()

    assert not backend.initialized
    assert not provider.initialized

    print("BACKEND LIFECYCLE: PASS")
    print("MODEL SUPPORT: PASS")
    print("REQUEST ADAPTER: PASS")
    print("CHAT RESPONSE ADAPTER: PASS")
    print("STREAM ADAPTER: PASS")
    print("TRANSFORMERS BACKEND TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())