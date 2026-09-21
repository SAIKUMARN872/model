import asyncio
import sys
from pathlib import Path
from unittest.mock import AsyncMock


PROJECT_ROOT = Path(__file__).resolve().parents[4]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage
from ai.providers.slm.mistral.provider import MistralProvider


async def main() -> None:
    provider = MistralProvider()

    await provider.initialize()

    mocked_response = ChatResponse(
        provider="mistral",
        model="mistralai/Mistral-7B-Instruct-v0.3",
        content="Hello from the mocked Mistral provider.",
        usage=ChatUsage(
            input_tokens=14,
            output_tokens=8,
            total_tokens=22,
            estimated_cost=0.0,
        ),
        latency_ms=42.5,
        finish_reason="stop",
        request_id="mock-mistral-001",
        metadata={
            "execution": "mock",
        },
    )

    provider.client.chat = AsyncMock(
        return_value=mocked_response
    )

    request = ChatRequest(
        model="mistralai/Mistral-7B-Instruct-v0.3",
        messages=[
            ChatMessage(
                role="user",
                content="Hello Mistral",
            )
        ],
        request_id="mock-mistral-001",
    )

    response = await provider.chat(request)

    print("MOCK CHAT: PASS")
    print("PROVIDER:", response.provider)
    print("MODEL:", response.model)
    print("CONTENT:", response.content)
    print("INPUT TOKENS:", response.usage.input_tokens)
    print("OUTPUT TOKENS:", response.usage.output_tokens)
    print("TOTAL TOKENS:", response.usage.total_tokens)
    print("COST:", response.usage.estimated_cost)
    print("REQUEST ID:", response.request_id)
    print(
        "CLIENT CHAT CALLED:",
        provider.client.chat.await_count,
    )

    assert response.provider == "mistral"
    assert response.model == "mistralai/Mistral-7B-Instruct-v0.3"
    assert response.content == (
        "Hello from the mocked Mistral provider."
    )
    assert response.usage.input_tokens == 14
    assert response.usage.output_tokens == 8
    assert response.usage.total_tokens == 22
    assert response.usage.estimated_cost == 0.0
    assert response.request_id == "mock-mistral-001"
    assert provider.client.chat.await_count == 1

    await provider.close()

    print("MISTRAL MOCK CHAT TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
