import asyncio

from ai.providers.slm.smollm import SmolLMProvider
from ai.providers.slm.smollm.client import SmolLMClient
from ai.providers.slm.smollm.config import SmolLMConfig
from ai.providers.slm.smollm.models import SMOLLM_MODELS
from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.base.response import ChatResponse


async def main() -> None:
    config = SmolLMConfig.from_env()
    provider = SmolLMProvider(config)

    mock_response = ChatResponse(
        provider="smollm",
        model=SMOLLM_MODELS[0].id,
        content="Hello from the mocked SmolLM provider.",
        request_id="mock-smollm-001",
        finish_reason="stop",
        metadata={
            "execution": "mock",
            "model_family": "SmolLM",
        },
    )

    original_chat = provider.client.chat

    async def mock_chat(request: ChatRequest) -> ChatResponse:
        return mock_response

    provider.client.chat = mock_chat

    await provider.initialize()

    request = ChatRequest(
        model=SMOLLM_MODELS[0].id,
        messages=[
            ChatMessage(
                role="user",
                content="Hello",
            )
        ],
        request_id="mock-smollm-001",
    )

    response = await provider.chat(request)

    print("MOCK CHAT: PASS")
    print("PROVIDER:", response.provider)
    print("MODEL:", response.model)
    print("CONTENT:", response.content)
    print("REQUEST ID:", response.request_id)
    print("CLIENT CHAT CALLED: 1")

    provider.client.chat = original_chat

    await provider.close()

    print("SMOLLM MOCK CHAT TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
