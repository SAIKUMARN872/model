from __future__ import annotations

import asyncio

from ai.providers.base.request import (
    ChatMessage,
    ChatRequest,
)
from ai.providers.llm.google.client import (
    GoogleClient,
)
from ai.providers.llm.google.config import (
    GoogleConfig,
)
from ai.providers.llm.google.provider import (
    GoogleProvider,
)


class MockGoogleClient(GoogleClient):
    """Offline Google client used for integration testing."""

    def __init__(self):
        super().__init__(
            GoogleConfig(
                api_key="mock-google-key"
            )
        )

    def generate_content(
        self,
        model,
        payload,
    ):
        return {
            "responseId": "mock-google-chat-001",
            "candidates": [
                {
                    "content": {
                        "role": "model",
                        "parts": [
                            {
                                "text": (
                                    "Hello from Google Gemini mock."
                                )
                            }
                        ],
                    },
                    "finishReason": "STOP",
                }
            ],
            "usageMetadata": {
                "promptTokenCount": 10,
                "candidatesTokenCount": 7,
                "totalTokenCount": 17,
            },
        }

    def stream_generate_content(
        self,
        model,
        payload,
    ):
        return (
            'data: {"responseId":"mock-google-stream-001",'
            '"candidates":[{"content":{"role":"model",'
            '"parts":[{"text":"Hello "}]}}]}\n'
            '\n'
            'data: {"responseId":"mock-google-stream-001",'
            '"candidates":[{"content":{"role":"model",'
            '"parts":[{"text":"from Google"}]},'
            '"finishReason":"STOP"}],'
            '"usageMetadata":{"promptTokenCount":5,'
            '"candidatesTokenCount":3,'
            '"totalTokenCount":8}}\n'
            '\n'
            'data: [DONE]\n'
            '\n'
        )


class MockGoogleProvider(GoogleProvider):
    """Google provider using the offline mock client."""

    def __init__(self):
        super().__init__(
            GoogleConfig(
                api_key="mock-google-key"
            )
        )

        self.client = MockGoogleClient()

        from ai.providers.llm.google.chat import GoogleChat
        from ai.providers.llm.google.stream import GoogleStream

        self.chat_adapter = GoogleChat(
            self.client
        )

        self.stream_adapter = GoogleStream(
            self.client
        )


async def main():
    print("=" * 100)
    print("MODELNOW GOOGLE MOCK INTEGRATION TEST")
    print("=" * 100)

    provider = MockGoogleProvider()

    # ------------------------------------------------------------------
    # TEST 1 - PROVIDER CONSTRUCTION
    # ------------------------------------------------------------------
    assert provider.name == "google"
    assert provider.google_config.api_key == "mock-google-key"

    print("TEST 1 - PROVIDER CONSTRUCTION: PASS")

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
        "gemini-2.5-pro",
        "gemini-2.5-flash",
    }

    print("TEST 2 - MODEL DISCOVERY: PASS")

    # ------------------------------------------------------------------
    # TEST 3 - MODEL MATCHING
    # ------------------------------------------------------------------
    assert await provider.supports_model(
        "gemini-2.5-pro"
    )

    assert await provider.supports_model(
        "gemini-2.5-flash"
    )

    assert not await provider.supports_model(
        "gemini-invalid"
    )

    print("TEST 3 - MODEL MATCHING: PASS")

    # ------------------------------------------------------------------
    # TEST 4 - MOCK CHAT
    # ------------------------------------------------------------------
    await provider.initialize()

    request = ChatRequest(
        model="gemini-2.5-flash",
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

    assert response.provider == "google"
    assert response.model == "gemini-2.5-flash"
    assert response.content == (
        "Hello from Google Gemini mock."
    )
    assert response.request_id == (
        "mock-google-chat-001"
    )
    assert response.finish_reason == "STOP"
    assert response.usage.total_tokens == 17

    print("TEST 4 - MOCK CHAT: PASS")

    # ------------------------------------------------------------------
    # TEST 5 - MOCK STREAMING
    # ------------------------------------------------------------------
    stream_request = ChatRequest(
        model="gemini-2.5-flash",
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
        "Hello from Google"
    )

    stop_chunks = [
        chunk
        for chunk in chunks
        if chunk.finish_reason == "STOP"
    ]

    assert stop_chunks

    print("TEST 5 - MOCK STREAMING: PASS")

    await provider.close()

    print("=" * 100)
    print("MODELNOW GOOGLE MOCK INTEGRATION: PASS")
    print("tests=5/5")
    print("=" * 100)


if __name__ == "__main__":
    asyncio.run(main())
