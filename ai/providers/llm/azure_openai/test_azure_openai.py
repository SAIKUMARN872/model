from __future__ import annotations

import asyncio
import json

from ai.providers.base.config import ProviderConfig
from ai.providers.base.request import ChatMessage, ChatRequest, ToolDefinition
from ai.providers.llm.azure_openai import (
    AzureDeployment,
    AzureOpenAIConfig,
    AzureOpenAIProvider,
    AzureOpenAIStreamParser,
    AzureTokenizer,
    DEFAULT_AZURE_DEPLOYMENTS,
)
from ai.providers.llm.azure_openai.utils import (
    parse_response,
    request_to_payload,
)


def test_models() -> None:
    assert len(DEFAULT_AZURE_DEPLOYMENTS) == 3

    names = {
        deployment.model_name
        for deployment in DEFAULT_AZURE_DEPLOYMENTS
    }

    assert names == {
        "gpt-5",
        "gpt-5-mini",
        "gpt-4.1",
    }

    print("MODEL DISCOVERY: PASS")


def test_config() -> None:
    config = AzureOpenAIConfig(
        endpoint="https://example.openai.azure.com",
        api_key="test-key",
        api_version="2025-04-01-preview",
    )

    assert config.configured
    assert "gpt-5" in config.deployment_url("gpt-5")
    assert "api-version=2025-04-01-preview" in config.deployment_url(
        "gpt-5"
    )
    assert config.headers["api-key"] == "test-key"

    print("CONFIGURATION: PASS")


def test_provider() -> None:
    provider = AzureOpenAIProvider(
        AzureOpenAIConfig(
            endpoint="https://example.openai.azure.com",
            api_key="test-key",
        )
    )

    assert provider.name == "azure_openai"
    assert provider.azure_config.endpoint == (
        "https://example.openai.azure.com"
    )

    print("PROVIDER CONSTRUCTION: PASS")


async def test_provider_models() -> None:
    provider = AzureOpenAIProvider(
        AzureOpenAIConfig(
            endpoint="https://example.openai.azure.com",
            api_key="test-key",
        )
    )

    models = await provider.list_models()

    assert len(models) == 3
    assert await provider.supports_model("gpt-5")
    assert await provider.supports_model("gpt-5-mini")
    assert await provider.supports_model("gpt-4.1")
    assert not await provider.supports_model("unknown-model")

    print("MODEL MATCHING: PASS")


def test_payload() -> None:
    request = ChatRequest(
        model="gpt-5",
        messages=[
            ChatMessage(
                role="system",
                content="You are helpful.",
            ),
            ChatMessage(
                role="user",
                content="Explain RAG.",
            ),
        ],
        temperature=0.2,
        max_tokens=100,
        top_p=0.9,
        stream=False,
        tools=[
            ToolDefinition(
                name="search",
                description="Search the web.",
                parameters={
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                        }
                    },
                    "required": ["query"],
                },
            )
        ],
    )

    payload = request_to_payload(request)

    assert len(payload["messages"]) == 2
    assert payload["temperature"] == 0.2
    assert payload["max_tokens"] == 100
    assert payload["top_p"] == 0.9
    assert len(payload["tools"]) == 1
    assert payload["tools"][0]["function"]["name"] == "search"

    print("REQUEST PAYLOAD: PASS")


def test_response_parser() -> None:
    data = {
        "id": "chatcmpl-test",
        "object": "chat.completion",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "RAG retrieves relevant context.",
                },
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": 25,
            "completion_tokens": 8,
            "total_tokens": 33,
        },
    }

    response = parse_response(
        data,
        deployment="gpt-5",
    )

    assert response.provider == "azure_openai"
    assert response.model == "gpt-5"
    assert response.content == (
        "RAG retrieves relevant context."
    )
    assert response.usage.input_tokens == 25
    assert response.usage.output_tokens == 8
    assert response.usage.total_tokens == 33
    assert response.finish_reason == "stop"

    print("RESPONSE PARSER: PASS")


def test_stream_parser() -> None:
    parser = AzureOpenAIStreamParser("gpt-5")

    line = (
        'data: {"id":"stream-1","choices":[{"delta":'
        '{"content":"Hello"},"finish_reason":null}]}'
    )

    chunk = parser.parse_line(line)

    assert chunk is not None
    assert chunk.provider == "azure_openai"
    assert chunk.model == "gpt-5"
    assert chunk.content == "Hello"

    done = parser.parse_line("data: [DONE]")

    assert done is not None
    assert done.done
    assert done.finish_reason == "stop"

    print("STREAM PARSER: PASS")


def test_tokenizer() -> None:
    tokenizer = AzureTokenizer("gpt-5")

    count = tokenizer.count_text(
        "ModelNow automatically selects the best model."
    )

    assert count > 0

    print("TOKENIZER: PASS")


async def test_lifecycle() -> None:
    provider = AzureOpenAIProvider(
        AzureOpenAIConfig(
            endpoint="https://example.openai.azure.com",
            api_key="test-key",
        )
    )

    await provider.initialize()

    assert provider.initialized

    await provider.close()

    assert not provider.initialized

    print("LIFECYCLE: PASS")


async def main() -> None:
    print("=" * 80)
    print("MODELNOW AZURE OPENAI INTEGRATION TEST")
    print("=" * 80)

    test_models()
    test_config()
    test_provider()
    await test_provider_models()
    test_payload()
    test_response_parser()
    test_stream_parser()
    test_tokenizer()
    await test_lifecycle()

    print("=" * 80)
    print("PASS - AZURE OPENAI INTEGRATION TEST")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
