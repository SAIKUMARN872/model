from __future__ import annotations

import asyncio

from ai.providers.base.config import ProviderConfig
from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.base.response import ChatResponse

from ai.providers.mlm.gemma import GemmaConfig, GemmaProvider


class MockGemmaClient:
    """Deterministic client used for provider contract testing."""

    def __init__(self) -> None:
        self.closed = False

    async def complete(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        if self.closed:
            raise RuntimeError("Mock Gemma client is closed.")

        return ChatResponse(
            provider="gemma",
            model=request.model,
            content="Mock Gemma response.",
            request_id=str(request.request_id),
            finish_reason="stop",
            metadata={
                "mock": True,
            },
        )

    async def close(self) -> None:
        self.closed = True


async def main() -> None:
    print("=" * 80)
    print("MODELNOW GEMMA MOCK CHAT TEST")
    print("=" * 80)

    gemma_config = GemmaConfig(
        model_id="google/gemma-3-4b-it",
    )

    provider = GemmaProvider(
        config=gemma_config.provider_config(),
        gemma_config=gemma_config,
    )

    mock_client = MockGemmaClient()

    provider.client = mock_client

    await provider.initialize()

    request = ChatRequest(
        model="google/gemma-3-4b-it",
        messages=[
            ChatMessage(
                role="user",
                content="Explain ModelNow in one sentence.",
            )
        ],
        temperature=0.2,
        max_tokens=64,
    )

    response = await provider.chat(request)

    assert isinstance(response, ChatResponse)
    assert response.provider == "gemma"
    assert response.model == "google/gemma-3-4b-it"
    assert response.content == "Mock Gemma response."
    assert response.request_id == str(request.request_id)
    assert response.finish_reason == "stop"
    assert response.metadata["mock"] is True

    print("TEST 1 - CHAT REQUEST: PASS")
    print("TEST 2 - CHAT RESPONSE: PASS")
    print("TEST 3 - REQUEST ID PROPAGATION: PASS")
    print("TEST 4 - RESPONSE METADATA: PASS")

    await provider.close()

    assert mock_client.closed
    assert not provider.initialized

    print("TEST 5 - PROVIDER SHUTDOWN: PASS")

    print()
    print("GEMMA MOCK CHAT: PASS")


if __name__ == "__main__":
    asyncio.run(main())
