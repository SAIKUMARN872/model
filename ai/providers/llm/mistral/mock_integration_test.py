from __future__ import annotations

import asyncio

from ai.providers.base.request import (
    ChatMessage,
    ChatRequest,
)
from ai.providers.llm.mistral.chat import MistralChat
from ai.providers.llm.mistral.client import MistralClient
from ai.providers.llm.mistral.config import MistralConfig
from ai.providers.llm.mistral.provider import MistralProvider
from ai.providers.llm.mistral.stream import MistralStream


class MockMistralClient(MistralClient):
    """Offline Mistral client used for integration testing."""

    def __init__(self):
        super().__init__(
            MistralConfig(
                api_key="mock-mistral-key"
            )
        )

    def chat_completions(self, payload):
        return {
            "id": "mock-mistral-chat-001",
            "object": "chat.completion",
            "model": payload["model"],
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": (
                            "Hello from Mistral mock."
                        ),
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 7,
                "total_tokens": 17,
            },
        }

    def stream_chat_completions(self, payload):
        return (
            'data: {"id":"mock-mistral-stream-001",'
            '"object":"chat.completion.chunk",'
            '"choices":[{"index":0,'
            '"delta":{"role":"assistant",'
            '"content":"Hello "},'
            '"finish_reason":null}]}\n'
            '\n'
            'data: {"id":"mock-mistral-stream-001",'
            '"object":"chat.completion.chunk",'
            '"choices":[{"index":0,'
            '"delta":{"content":"from Mistral"},'
            '"finish_reason":"stop"}],'
            '"usage":{"prompt_tokens":5,'
            '"completion_tokens":3,'
            '"total_tokens":8}}\n'
            '\n'
            'data: [DONE]\n'
            '\n'
        )


class MockMistralProvider(MistralProvider):
    """Mistral provider using the offline mock client."""

    def __init__(self):
        super().__init__(
            MistralConfig(
                api_key="mock-mistral-key"
            )
        )

        self.client = MockMistralClient()

        self.chat_adapter = MistralChat(
            self.client
        )

        self.stream_adapter = MistralStream(
            self.client
        )


async def main():
    print("=" * 100)
    print("MODELNOW MISTRAL MOCK INTEGRATION TEST")
    print("=" * 100)

    provider = MockMistralProvider()

    # ------------------------------------------------------------------
    # TEST 1 - PROVIDER CONSTRUCTION
    # ------------------------------------------------------------------
    assert provider.name == "mistral"
    assert (
        provider.mistral_config.api_key
        == "mock-mistral-key"
    )

    print(
        "TEST 1 - PROVIDER CONSTRUCTION: PASS"
    )

    # ------------------------------------------------------------------
    # TEST 2 - MODEL DISCOVERY
    # ------------------------------------------------------------------
    models = await provider.list_models()

    assert len(models) == 2

    model_ids = {
        model.id
        for model in models
    }

    assert model_ids == {
        "mistral-large-latest",
        "mistral-medium-latest",
    }

    print(
        "TEST 2 - MODEL DISCOVERY: PASS"
    )

    # ------------------------------------------------------------------
    # TEST 3 - MODEL MATCHING
    # ------------------------------------------------------------------
    assert await provider.supports_model(
        "mistral-large-latest"
    )

    assert await provider.supports_model(
        "mistral-medium-latest"
    )

    assert not await provider.supports_model(
        "mistral-invalid"
    )

    print(
        "TEST 3 - MODEL MATCHING: PASS"
    )

    # ------------------------------------------------------------------
    # TEST 4 - MOCK CHAT
    # ------------------------------------------------------------------
    await provider.initialize()

    request = ChatRequest(
        model="mistral-large-latest",
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

    assert response.provider == "mistral"
    assert (
        response.model
        == "mistral-large-latest"
    )
    assert response.content == (
        "Hello from Mistral mock."
    )
    assert response.request_id == (
        "mock-mistral-chat-001"
    )
    assert response.finish_reason == "stop"
    assert response.usage.total_tokens == 17

    print(
        "TEST 4 - MOCK CHAT: PASS"
    )

    # ------------------------------------------------------------------
    # TEST 5 - MOCK STREAMING
    # ------------------------------------------------------------------
    stream_request = ChatRequest(
        model="mistral-large-latest",
        messages=[
            ChatMessage(
                role="user",
                content="Hello ModelNow",
            )
        ],
        stream=True,
    )

    chunks = []

    async for chunk in provider.stream(
        stream_request
    ):
        chunks.append(chunk)

    assert len(chunks) >= 2

    text = "".join(
        chunk.content
        for chunk in chunks
    )

    assert text == (
        "Hello from Mistral"
    )

    stop_chunks = [
        chunk
        for chunk in chunks
        if chunk.finish_reason == "stop"
    ]

    assert stop_chunks

    print(
        "TEST 5 - MOCK STREAMING: PASS"
    )

    await provider.close()

    print("=" * 100)
    print(
        "MODELNOW MISTRAL MOCK INTEGRATION: PASS"
    )
    print("tests=5/5")
    print("=" * 100)


if __name__ == "__main__":
    asyncio.run(main())
