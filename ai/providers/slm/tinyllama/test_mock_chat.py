import asyncio

from ai.providers.slm.tinyllama import (
    TinyLlamaProvider,
)
from ai.providers.base.request import (
    ChatMessage,
    ChatRequest,
)
from ai.providers.base.response import (
    ChatResponse,
    ChatUsage,
)


async def main() -> None:
    provider = TinyLlamaProvider()

    await provider.initialize()

    calls = 0

    async def mock_chat(
        request: ChatRequest,
    ) -> ChatResponse:
        nonlocal calls

        calls += 1

        return ChatResponse(
            provider="tinyllama",
            model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
            content="Hello from the mocked TinyLlama provider.",
            usage=ChatUsage(
                input_tokens=12,
                output_tokens=8,
                total_tokens=20,
                estimated_cost=0.0,
            ),
            request_id="mock-tinyllama-001",
        )

    provider.client.chat = mock_chat

    request = ChatRequest(
        model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        messages=[
            ChatMessage(
                role="user",
                content="Hello TinyLlama",
            )
        ],
    )

    response = await provider.chat(request)

    print("MOCK CHAT:", "PASS")
    print("PROVIDER:", response.provider)
    print("MODEL:", response.model)
    print("CONTENT:", response.content)
    print(
        "INPUT TOKENS:",
        response.usage.input_tokens,
    )
    print(
        "OUTPUT TOKENS:",
        response.usage.output_tokens,
    )
    print(
        "TOTAL TOKENS:",
        response.usage.total_tokens,
    )
    print(
        "COST:",
        response.usage.estimated_cost,
    )
    print("REQUEST ID:", response.request_id)
    print("CLIENT CHAT CALLED:", calls)

    assert response.provider == "tinyllama"
    assert (
        response.model
        == "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    )
    assert (
        response.content
        == "Hello from the mocked TinyLlama provider."
    )
    assert response.usage.input_tokens == 12
    assert response.usage.output_tokens == 8
    assert response.usage.total_tokens == 20
    assert response.usage.estimated_cost == 0.0
    assert response.request_id == "mock-tinyllama-001"
    assert calls == 1

    await provider.close()

    print("TINYLLAMA MOCK CHAT TEST: PASS")


asyncio.run(main())
