from __future__ import annotations

import asyncio

from ai.providers.base.request import ChatMessage, ChatRequest

from .client import DeepSeekClient
from .config import DeepSeekConfig
from .provider import DeepSeekProvider
from .stream import DeepSeekStream


class MockDeepSeekClient(DeepSeekClient):
    """Offline DeepSeek client used for integration testing."""

    def __init__(self) -> None:
        super().__init__(
            DeepSeekConfig(
                api_key="mock-deepseek-key",
                enabled=True,
            )
        )

    def chat(self, payload: dict) -> dict:
        return {
            "id": "mock-deepseek-chat-001",
            "object": "chat.completion",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": "Hello from DeepSeek mock.",
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 6,
                "total_tokens": 16,
            },
        }

    def stream_chat(self, payload: dict) -> str:
        return (
            'data: {"id":"mock-stream-001","object":"chat.completion.chunk",'
            '"choices":[{"index":0,"delta":{"role":"assistant","content":"Hello "},'
            '"finish_reason":null}]}\n\n'
            'data: {"id":"mock-stream-001","object":"chat.completion.chunk",'
            '"choices":[{"index":0,"delta":{"content":"from DeepSeek."},'
            '"finish_reason":null}]}\n\n'
            'data: {"id":"mock-stream-001","object":"chat.completion.chunk",'
            '"choices":[{"index":0,"delta":{},'
            '"finish_reason":"stop"}]}\n\n'
            'data: [DONE]\n\n'
        )


def test_provider_construction() -> None:
    provider = DeepSeekProvider(
        DeepSeekConfig(
            api_key="mock-key",
            enabled=True,
        )
    )

    assert provider.name == "deepseek"
    assert provider.initialized is False

    print("TEST 1 - PROVIDER CONSTRUCTION: PASS")


async def test_model_discovery() -> None:
    provider = DeepSeekProvider(
        DeepSeekConfig(
            api_key="mock-key",
            enabled=True,
        )
    )

    models = await provider.list_models()

    assert len(models) == 2
    assert {
        model.id
        for model in models
    } == {
        "deepseek-chat",
        "deepseek-reasoner",
    }

    print("TEST 2 - MODEL DISCOVERY: PASS")


async def test_model_matching() -> None:
    provider = DeepSeekProvider(
        DeepSeekConfig(
            api_key="mock-key",
            enabled=True,
        )
    )

    assert await provider.supports_model(
        "deepseek-chat"
    )

    assert await provider.supports_model(
        "deepseek-reasoner"
    )

    assert not await provider.supports_model(
        "unknown-deepseek-model"
    )

    print("TEST 3 - MODEL MATCHING: PASS")


async def test_mock_chat() -> None:
    client = MockDeepSeekClient()

    provider = DeepSeekProvider(
        DeepSeekConfig(
            api_key="mock-key",
            enabled=True,
        )
    )

    provider.client = client
    provider.chat_adapter = provider.chat_adapter.__class__(
        client
    )

    await provider.initialize()

    request = ChatRequest(
        model="deepseek-chat",
        messages=[
            ChatMessage(
                role="user",
                content="Hello ModelNow",
            )
        ],
    )

    response = await provider.chat(
        request
    )

    assert response.provider == "deepseek"
    assert response.model == "deepseek-chat"
    assert response.content == "Hello from DeepSeek mock."
    assert response.finish_reason == "stop"
    assert response.usage.input_tokens == 10
    assert response.usage.output_tokens == 6
    assert response.usage.total_tokens == 16

    print("TEST 4 - MOCK CHAT: PASS")


async def test_mock_streaming() -> None:
    client = MockDeepSeekClient()

    stream_adapter = DeepSeekStream(
        client
    )

    request = ChatRequest(
        model="deepseek-chat",
        messages=[
            ChatMessage(
                role="user",
                content="Stream from ModelNow",
            )
        ],
        stream=True,
    )

    chunks = []

    async for chunk in stream_adapter.stream(
        request
    ):
        chunks.append(chunk)

    content = "".join(
        chunk.content
        for chunk in chunks
    )

    assert content == "Hello from DeepSeek."

    assert any(
        chunk.finish_reason == "stop"
        for chunk in chunks
    )

    assert chunks[-1].done is True

    print("TEST 5 - MOCK STREAMING: PASS")


async def main() -> None:
    print("=" * 100)
    print("MODELNOW DEEPSEEK MOCK INTEGRATION TEST")
    print("=" * 100)

    test_provider_construction()

    await test_model_discovery()

    await test_model_matching()

    await test_mock_chat()

    await test_mock_streaming()

    print("=" * 100)
    print("MODELNOW DEEPSEEK MOCK INTEGRATION: PASS")
    print("tests=5/5")
    print("=" * 100)


if __name__ == "__main__":
    asyncio.run(main())
