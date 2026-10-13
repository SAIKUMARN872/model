from __future__ import annotations

import asyncio

from ...base.config import ProviderConfig
from ...base.request import ChatMessage, ChatRequest
from ...base.response import ChatResponse, ChatUsage

from .provider import YiProvider


class MockYiClient:
    def __init__(self) -> None:
        self._closed = False

    @property
    def closed(self) -> bool:
        return self._closed

    async def complete(self, request: ChatRequest) -> ChatResponse:
        return ChatResponse(
            provider="yi",
            model=request.model,
            content="ModelNow Yi mock response.",
            usage=ChatUsage(
                input_tokens=12,
                output_tokens=8,
            ),
            request_id=str(request.request_id),
            finish_reason="stop",
            metadata={
                "mock": True,
                "provider_family": "yi",
            },
        )

    async def close(self) -> None:
        self._closed = True


async def main() -> None:
    print("=" * 72)
    print("MODELNOW YI MOCK CHAT TEST")
    print("=" * 72)

    provider = YiProvider(
        config=ProviderConfig(
            provider_id="yi",
            enabled=True,
        )
    )

    await provider.initialize()

    provider.client = MockYiClient()

    request = ChatRequest(
        model="01-ai/Yi-1.5-9B-Chat",
        messages=[
            ChatMessage(
                role="user",
                content="Explain automatic model routing.",
            )
        ],
        max_tokens=64,
    )

    # TEST 1
    assert request.message_count == 1
    assert request.model == "01-ai/Yi-1.5-9B-Chat"

    print("TEST 1 - CHAT REQUEST: PASS")

    # TEST 2
    response = await provider.chat(request)

    assert isinstance(response, ChatResponse)
    assert response.provider == "yi"
    assert response.model == request.model
    assert response.content == "ModelNow Yi mock response."

    print("TEST 2 - CHAT RESPONSE: PASS")

    # TEST 3
    assert response.request_id == str(request.request_id)

    print("TEST 3 - REQUEST ID PROPAGATION: PASS")

    # TEST 4
    assert response.usage.input_tokens == 12
    assert response.usage.output_tokens == 8
    assert response.usage.total_tokens == 20
    assert response.metadata["mock"] is True
    assert response.metadata["provider_family"] == "yi"

    print("TEST 4 - RESPONSE METADATA: PASS")

    # TEST 5
    await provider.close()

    assert provider.initialized is False
    assert provider.client.closed is True

    print("TEST 5 - PROVIDER SHUTDOWN: PASS")

    print()
    print("YI MOCK CHAT: PASS")


if __name__ == "__main__":
    asyncio.run(main())
