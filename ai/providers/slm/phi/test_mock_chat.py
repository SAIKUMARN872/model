import asyncio
from unittest.mock import AsyncMock

from ai.providers.slm.phi import PhiProvider
from ai.providers.slm.phi.client import PhiClient
from ai.providers.slm.phi.config import PhiConfig
from ai.providers.slm.phi.models import PHI_MODELS
from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage


async def main() -> None:
    provider = PhiProvider(PhiConfig())

    await provider.initialize()

    request = ChatRequest(
        model=PHI_MODELS[0].id,
        messages=[
            ChatMessage(
                role="user",
                content="Hello from the mocked Phi provider.",
            )
        ],
        request_id="mock-phi-001",
    )

    mock_response = ChatResponse(
        provider="phi",
        model=PHI_MODELS[0].id,
        content="Hello from the mocked Phi provider.",
        usage=ChatUsage(
            input_tokens=13,
            output_tokens=8,
            total_tokens=21,
            estimated_cost=0.0,
        ),
        latency_ms=12.5,
        finish_reason="stop",
        request_id="mock-phi-001",
    )

    provider.client.chat = AsyncMock(
        return_value=mock_response
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
    print("CLIENT CHAT CALLED:", provider.client.chat.call_count)

    await provider.close()

    print("PHI MOCK CHAT TEST: PASS")


asyncio.run(main())
