from __future__ import annotations

import asyncio

from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.base.response import ChatResponse

from ai.providers.mlm.qwen import QwenConfig, QwenProvider


class MockQwenClient:
    """Deterministic client used for provider contract testing."""

    def __init__(self) -> None:
        self.closed = False

    async def complete(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        if self.closed:
            raise RuntimeError("Mock Qwen client is closed.")

        return ChatResponse(
            provider="qwen",
            model=request.model,
            content="Mock Qwen response.",
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
    print("MODELNOW QWEN MOCK CHAT TEST")
    print("=" * 80)

    qwen_config = QwenConfig(
        model_id="Qwen/Qwen3-8B",
    )

    provider = QwenProvider(
        config=qwen_config.provider_config(),
        qwen_config=qwen_config,
    )

    mock_client = MockQwenClient()
    provider.client = mock_client

    await provider.initialize()

    request = ChatRequest(
        model="Qwen/Qwen3-8B",
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
    assert response.provider == "qwen"
    assert response.model == "Qwen/Qwen3-8B"
    assert response.content == "Mock Qwen response."
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
    print("QWEN MOCK CHAT: PASS")


if __name__ == "__main__":
    asyncio.run(main())
