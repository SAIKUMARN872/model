import asyncio

from ai.providers.slm.qwen import QwenProvider
from ai.providers.slm.qwen.client import QwenClient
from ai.providers.slm.qwen.models import QWEN_MODELS
from ai.providers.slm.qwen.config import QwenConfig
from ai.providers.slm.qwen.tokenizer import QwenTokenizer

from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage


class MockQwenClient(QwenClient):
    def __init__(self, config: QwenConfig) -> None:
        super().__init__(config)
        self.chat_calls = 0

    async def chat(self, request: ChatRequest) -> ChatResponse:
        self.chat_calls += 1

        return ChatResponse(
            provider="qwen",
            model=request.model,
            content="Hello from the mocked Qwen provider.",
            usage=ChatUsage(
                input_tokens=12,
                output_tokens=8,
                total_tokens=20,
                estimated_cost=0.0,
            ),
            latency_ms=5.0,
            time_to_first_token_ms=5.0,
            finish_reason="stop",
            request_id=request.request_id,
            metadata={
                "execution": "mock",
                "model_loaded": False,
                "cost": 0.0,
            },
        )


async def main() -> None:
    provider = QwenProvider()

    mock_client = MockQwenClient(provider.config)
    provider.client = mock_client

    await provider.initialize()

    request = ChatRequest(
        model=QWEN_MODELS[0].id,
        messages=[
            ChatMessage(
                role="user",
                content="Hello Qwen.",
            )
        ],
        request_id="mock-qwen-001",
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
    print("CLIENT CHAT CALLED:", mock_client.chat_calls)

    assert response.provider == "qwen"
    assert response.model == QWEN_MODELS[0].id
    assert response.content == "Hello from the mocked Qwen provider."
    assert response.usage.total_tokens == 20
    assert response.usage.estimated_cost == 0.0
    assert response.request_id == "mock-qwen-001"
    assert mock_client.chat_calls == 1

    await provider.close()

    print("QWEN MOCK CHAT TEST: PASS")


asyncio.run(main())
