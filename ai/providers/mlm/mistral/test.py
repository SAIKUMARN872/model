from __future__ import annotations

import asyncio
from types import SimpleNamespace

from ai.providers.base.request import ChatMessage, ChatRequest

from .chat import MistralChat
from .config import MistralConfig
from .models import DEFAULT_MISTRAL_MODELS
from .provider import MistralProvider


class FakeAsyncChat:
    async def complete_async(self, **kwargs):
        message = SimpleNamespace(
            content="Hello from mocked Mistral.",
            tool_calls=[],
        )
        choice = SimpleNamespace(
            message=message,
            finish_reason="stop",
        )
        usage = SimpleNamespace(
            prompt_tokens=10,
            completion_tokens=7,
            total_tokens=17,
        )
        return SimpleNamespace(
            model=kwargs["model"],
            choices=[choice],
            usage=usage,
        )


class FakeRawClient:
    def __init__(self):
        self.chat = FakeAsyncChat()


class FakeClient:
    def __init__(self):
        self.raw_client = FakeRawClient()


async def main() -> None:
    config = MistralConfig(api_key="test-key")
    provider = MistralProvider(mistral_config=config)

    print("MISTRAL IMPORT: PASS")
    print("MISTRAL MODELS:", len(DEFAULT_MISTRAL_MODELS))

    health = await provider.health_check()
    assert health.healthy is True
    print("MISTRAL HEALTH: PASS")

    await provider.initialize()
    print("MISTRAL INITIALIZE: PASS")

    models = await provider.list_models()
    assert len(models) == 2
    assert all(model.provider == "mistral" for model in models)
    print("MISTRAL MODEL LIST: PASS")

    assert provider.supports_model("mistral-small-latest")
    assert provider.supports_model("mistral-medium-latest")
    assert not provider.supports_model("unknown-model")
    print("MISTRAL MODEL SUPPORT: PASS")

    provider.chat_client.client = FakeClient()

    request = ChatRequest(
        model="mistral-small-latest",
        messages=(
            ChatMessage(
                role="user",
                content="Say hello."
            ),
        ),
    )

    response = await provider.chat(request)

    assert response.provider == "mistral"
    assert response.model == "mistral-small-latest"
    assert response.content == "Hello from mocked Mistral."
    assert response.finish_reason == "stop"
    assert response.usage.input_tokens == 10
    assert response.usage.output_tokens == 7
    assert response.usage.total_tokens == 17
    assert response.latency_ms is not None

    print("MISTRAL MOCK CHAT: PASS")
    print("CONTENT:", response.content)
    print("INPUT TOKENS:", response.usage.input_tokens)
    print("OUTPUT TOKENS:", response.usage.output_tokens)
    print("LATENCY:", response.latency_ms)

    await provider.close()
    print("MISTRAL PROVIDER: PASS")


if __name__ == "__main__":
    asyncio.run(main())
