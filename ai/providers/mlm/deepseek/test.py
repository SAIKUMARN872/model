from __future__ import annotations

import asyncio

from ai.providers.base.config import ProviderConfig
from ai.providers.base.request import ChatMessage, ChatRequest

from .config import DeepSeekConfig
from .provider import DeepSeekProvider


class FakeResponse:
    class Choice:
        class Message:
            content = "Mock DeepSeek response."

        message = Message()
        finish_reason = "stop"

    choices = [Choice()]

    class Usage:
        prompt_tokens = 10
        completion_tokens = 5

    usage = Usage()


async def run() -> None:
    config = ProviderConfig(
        provider_id="deepseek",
        enabled=True,
    )

    deepseek_config = DeepSeekConfig(
        api_key=None,
    )

    provider = DeepSeekProvider(
        config=config,
        deepseek_config=deepseek_config,
    )

    assert provider.name == "deepseek"
    assert provider.version == "1.0.0"
    assert provider.supports_model("deepseek-v4-flash")

    models = await provider.list_models()
    assert len(models) == 2
    assert all(model.provider == "deepseek" for model in models)

    health = await provider.health_check()
    assert health.healthy is False

    await provider.initialize()

    async def fake_request(*, method, path, headers=None, json=None, params=None):
        assert method == "POST"
        assert path == "/chat/completions"
        assert json["model"] == "deepseek-v4-flash"
        return FakeResponse()

    provider.client.request = fake_request

    request = ChatRequest(
        model="deepseek-v4-flash",
        messages=(
            ChatMessage(
                role="user",
                content="Hello",
            ),
        ),
    )

    response = await provider.chat(request)

    assert response.provider == "deepseek"
    assert response.model == "deepseek-v4-flash"
    assert response.content == "Mock DeepSeek response."
    assert response.usage.input_tokens == 10
    assert response.usage.output_tokens == 5
    assert response.latency_ms is not None

    await provider.close()

    print("DEEPSEEK IMPORT: PASS")
    print("DEEPSEEK MODELS: PASS")
    print("DEEPSEEK HEALTH: PASS")
    print("DEEPSEEK INITIALIZE: PASS")
    print("DEEPSEEK MOCK CHAT: PASS")
    print("DEEPSEEK PROVIDER: PASS")


if __name__ == "__main__":
    asyncio.run(run())
