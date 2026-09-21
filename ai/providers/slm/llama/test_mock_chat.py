import asyncio
import sys
from pathlib import Path
from unittest.mock import AsyncMock

PROJECT_ROOT = Path(__file__).resolve().parents[4]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage
from ai.providers.slm.llama.provider import LlamaProvider


async def main():
    provider = LlamaProvider()

    await provider.initialize()

    expected_response = ChatResponse(
        provider="llama",
        model="meta-llama/Llama-3.2-1B-Instruct",
        content="Hello from the mocked Llama provider.",
        usage=ChatUsage(
            input_tokens=12,
            output_tokens=7,
            total_tokens=19,
            estimated_cost=0.0,
        ),
        finish_reason="stop",
        request_id="mock-llama-001",
        metadata={
            "execution": "local",
            "mock": True,
        },
    )

    provider.client.chat = AsyncMock(return_value=expected_response)

    request = ChatRequest(
        model="meta-llama/Llama-3.2-1B-Instruct",
        messages=(
            ChatMessage(
                role="user",
                content="Hello Llama",
            ),
        ),
        request_id="mock-llama-001",
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
    print("CLIENT CHAT CALLED:", provider.client.chat.await_count)

    assert response.provider == "llama"
    assert response.model == "meta-llama/Llama-3.2-1B-Instruct"
    assert response.content == "Hello from the mocked Llama provider."
    assert response.usage.total_tokens == 19
    assert response.usage.estimated_cost == 0.0
    assert response.request_id == "mock-llama-001"
    assert provider.client.chat.await_count == 1

    await provider.close()

    print("LLAMA MOCK CHAT TEST: PASS")


asyncio.run(main())
