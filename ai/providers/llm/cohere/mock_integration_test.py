from __future__ import annotations

import asyncio

from ...base.config import ProviderConfig
from ...base.request import ChatMessage, ChatRequest
from .client import CohereClient
from .config import CohereConfig
from .models import COHERE_MODELS
from .provider import CohereProvider


def test_provider_construction() -> None:
    provider = CohereProvider(
        ProviderConfig(
            provider_id="cohere",
            enabled=True,
        ),
        CohereConfig(
            provider_id="cohere",
            api_key="mock-cohere-key",
        ),
    )

    assert provider.name == "Cohere"
    assert provider.cohere_config.api_key == "mock-cohere-key"


def test_model_discovery() -> None:
    async def run() -> None:
        provider = CohereProvider(
            ProviderConfig(provider_id="cohere"),
            CohereConfig(
                provider_id="cohere",
                api_key="mock-cohere-key",
            ),
        )

        models = await provider.list_models()

        assert isinstance(models, list)
        assert len(models) > 0

        for model in models:
            assert model.provider == "cohere"
            assert model.id

    asyncio.run(run())


def test_model_matching() -> None:
    async def run() -> None:
        provider = CohereProvider(
            ProviderConfig(provider_id="cohere"),
            CohereConfig(
                provider_id="cohere",
                api_key="mock-cohere-key",
            ),
        )

        models = await provider.list_models()

        assert len(models) > 0

        model = models[0]

        assert await provider.supports_model(model.id)

        if model.aliases:
            assert await provider.supports_model(model.aliases[0])

        assert not await provider.supports_model(
            "modelnow-unknown-cohere-model"
        )

    asyncio.run(run())


def test_mock_chat() -> None:
    original_chat = CohereClient.chat

    def mock_chat(self, payload):
        assert payload["model"]
        assert payload["messages"]

        return {
            "id": "mock-cohere-request-001",
            "model": payload["model"],
            "finish_reason": {
                "reason": "COMPLETE"
            },
            "message": {
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "ModelNow is an AI execution platform."
                    }
                ]
            },
            "usage": {
                "billed_units": {
                    "input_tokens": 12,
                    "output_tokens": 8
                },
                "tokens": {
                    "input_tokens": 12,
                    "output_tokens": 8
                }
            }
        }

    CohereClient.chat = mock_chat

    async def run() -> None:
        provider = CohereProvider(
            ProviderConfig(
                provider_id="cohere",
                enabled=True,
            ),
            CohereConfig(
                provider_id="cohere",
                api_key="mock-cohere-key",
            ),
        )

        await provider.initialize()

        models = await provider.list_models()
        assert models

        request = ChatRequest(
            model=models[0].id,
            messages=[
                ChatMessage(
                    role="user",
                    content="What is ModelNow?"
                )
            ],
            temperature=0.2,
            max_tokens=100,
        )

        response = await provider.chat(request)

        assert response.provider == "cohere"
        assert response.model == models[0].id
        assert response.content
        assert "ModelNow" in response.content
        assert response.request_id == "mock-cohere-request-001"
        assert response.usage.input_tokens == 12
        assert response.usage.output_tokens == 8

        await provider.close()

    try:
        asyncio.run(run())
    finally:
        CohereClient.chat = original_chat


def test_mock_stream() -> None:
    original_stream_chat = CohereClient.stream_chat

    def mock_stream_chat(self, payload):
        assert payload["model"]
        assert payload["stream"] is True

        return (
            'data: {"type":"content-delta","delta":{"message":{"content":"ModelNow "}}}\n\n'
            'data: {"type":"content-delta","delta":{"message":{"content":"AI platform"}}}\n\n'
            'data: {"type":"message-end","delta":{"finish_reason":"COMPLETE"}}\n\n'
            'data: [DONE]\n\n'
        )

    CohereClient.stream_chat = mock_stream_chat

    async def run() -> None:
        provider = CohereProvider(
            ProviderConfig(
                provider_id="cohere",
                enabled=True,
            ),
            CohereConfig(
                provider_id="cohere",
                api_key="mock-cohere-key",
            ),
        )

        await provider.initialize()

        models = await provider.list_models()
        assert models

        request = ChatRequest(
            model=models[0].id,
            messages=[
                ChatMessage(
                    role="user",
                    content="Explain ModelNow."
                )
            ],
            stream=True,
        )

        chunks = []

        async for chunk in provider.stream(request):
            chunks.append(chunk)

        assert chunks

        text = "".join(
            chunk.content
            for chunk in chunks
            if chunk.content
        )

        assert text == "ModelNow AI platform"

        finish_chunks = [
            chunk
            for chunk in chunks
            if chunk.finish_reason
        ]

        assert finish_chunks
        assert finish_chunks[0].finish_reason == "COMPLETE"

        done_chunks = [
            chunk
            for chunk in chunks
            if chunk.done
        ]

        assert done_chunks

        await provider.close()

    try:
        asyncio.run(run())
    finally:
        CohereClient.stream_chat = original_stream_chat


def main() -> None:
    print("=" * 88)
    print("MODELNOW COHERE MOCK INTEGRATION TEST")
    print("=" * 88)

    tests = [
        ("PROVIDER CONSTRUCTION", test_provider_construction),
        ("MODEL DISCOVERY", test_model_discovery),
        ("MODEL MATCHING", test_model_matching),
        ("MOCK CHAT", test_mock_chat),
        ("MOCK STREAMING", test_mock_stream),
    ]

    passed = 0

    for number, (name, test) in enumerate(tests, start=1):
        try:
            test()
            print(f"TEST {number} - {name}: PASS")
            passed += 1
        except Exception as exc:
            print(f"TEST {number} - {name}: FAIL")
            print(f"  error={exc!r}")

    print()
    print(
        "MODELNOW COHERE MOCK INTEGRATION: "
        f"{'PASS' if passed == len(tests) else 'FAIL'}"
    )
    print(f"tests={passed}/{len(tests)}")
    print("=" * 88)


if __name__ == "__main__":
    main()
