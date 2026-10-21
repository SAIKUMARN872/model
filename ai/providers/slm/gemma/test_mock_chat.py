from __future__ import annotations

import asyncio

from ...base.request import ChatMessage, ChatRequest
from ...base.response import ChatResponse, ChatUsage

from .provider import GemmaProvider


async def main() -> None:
    provider = GemmaProvider()

    calls = 0

    async def mock_chat(request: ChatRequest) -> ChatResponse:
        nonlocal calls
        calls += 1

        return ChatResponse(
            provider="gemma",
            model=request.model,
            content="Mock Gemma response",
            usage=ChatUsage(
                input_tokens=10,
                output_tokens=6,
                total_tokens=16,
                estimated_cost=0.0,
            ),
            latency_ms=25.0,
            finish_reason="stop",
            request_id=str(request.request_id),
        )

    provider.client.chat = mock_chat

    await provider.initialize()

    request = ChatRequest(
        model="google/gemma-3-1b-it",
        messages=[
            ChatMessage(
                role="user",
                content="Hello Gemma",
            )
        ],
    )

    response = await provider.chat(request)

    assert response.provider == "gemma"
    assert response.model == "google/gemma-3-1b-it"
    assert response.content == "Mock Gemma response"
    assert response.usage.input_tokens == 10
    assert response.usage.output_tokens == 6
    assert response.usage.total_tokens == 16
    assert response.request_id == str(request.request_id)
    assert calls == 1

    await provider.close()

    assert provider.initialized is False

    print("GEMMA MOCK CHAT: PASS")


if __name__ == "__main__":
    asyncio.run(main())
