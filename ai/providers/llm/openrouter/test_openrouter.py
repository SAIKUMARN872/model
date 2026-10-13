from __future__ import annotations

import asyncio

from ai.providers.base.request import (
    ChatMessage,
    ChatRequest,
    ToolDefinition,
)
from ai.providers.llm.openrouter import (
    DEFAULT_OPENROUTER_MODELS,
    OpenRouterConfig,
    OpenRouterProvider,
    OpenRouterStreamParser,
    OpenRouterTokenizer,
)
from ai.providers.llm.openrouter.utils import (
    parse_model,
    parse_response,
    request_to_payload,
)


def test_models() -> None:
    assert len(DEFAULT_OPENROUTER_MODELS) == 3

    names = {
        model.id
        for model in DEFAULT_OPENROUTER_MODELS
    }

    assert "openai/gpt-4o" in names
    assert "anthropic/claude-sonnet-4" in names
    assert "google/gemini-2.5-pro" in names

    print("MODEL DISCOVERY: PASS")


def test_config() -> None:
    config = OpenRouterConfig(
        endpoint="https://openrouter.ai/api/v1",
        api_key="test-key",
        http_referer="https://modelnow.ai",
        x_title="ModelNow",
    )

    assert config.configured
    assert config.chat_completions_url == (
        "https://openrouter.ai/api/v1/chat/completions"
    )
    assert config.models_url == (
        "https://openrouter.ai/api/v1/models"
    )
    assert config.headers["Authorization"] == (
        "Bearer test-key"
    )
    assert config.headers["HTTP-Referer"] == (
        "https://modelnow.ai"
    )
    assert config.headers["X-Title"] == "ModelNow"

    print("CONFIGURATION: PASS")


def test_provider() -> None:
    provider = OpenRouterProvider(
        OpenRouterConfig(
            endpoint="https://openrouter.ai/api/v1",
            api_key="test-key",
        )
    )

    assert provider.name == "openrouter"
    assert provider.openrouter_config.endpoint == (
        "https://openrouter.ai/api/v1"
    )

    print("PROVIDER CONSTRUCTION: PASS")


async def test_provider_models() -> None:
    provider = OpenRouterProvider(
        OpenRouterConfig(
            endpoint="https://openrouter.ai/api/v1",
            api_key=None,
        )
    )

    models = await provider.list_models()

    assert len(models) == 3

    assert await provider.supports_model(
        "openai/gpt-4o"
    )

    assert await provider.supports_model(
        "anthropic/claude-sonnet-4"
    )

    assert await provider.supports_model(
        "google/gemini-2.5-pro"
    )

    assert not await provider.supports_model(
        "unknown/model"
    )

    print("MODEL MATCHING: PASS")


def test_payload() -> None:
    request = ChatRequest(
        model="openai/gpt-4o",
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

    assert payload["model"] == "openai/gpt-4o"
    assert len(payload["messages"]) == 2
    assert payload["temperature"] == 0.2
    assert payload["max_tokens"] == 100
    assert payload["top_p"] == 0.9
    assert payload["stream"] is False
    assert len(payload["tools"]) == 1
    assert (
        payload["tools"][0]["function"]["name"]
        == "search"
    )

    print("REQUEST PAYLOAD: PASS")


def test_response_parser() -> None:
    data = {
        "id": "gen-test-openrouter-001",
        "object": "chat.completion",
        "model": "openai/gpt-4o",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": (
                        "RAG retrieves relevant context."
                    ),
                },
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": 25,
            "completion_tokens": 8,
            "total_tokens": 33,
            "cost": 0.000125,
        },
    }

    response = parse_response(
        data,
        deployment="openai/gpt-4o",
    )

    assert response.provider == "openrouter"
    assert response.model == "openai/gpt-4o"
    assert response.content == (
        "RAG retrieves relevant context."
    )
    assert response.usage.input_tokens == 25
    assert response.usage.output_tokens == 8
    assert response.usage.total_tokens == 33
    assert response.usage.estimated_cost == 0.000125
    assert response.finish_reason == "stop"
    assert response.request_id == (
        "gen-test-openrouter-001"
    )

    print("RESPONSE PARSER: PASS")


def test_stream_parser() -> None:
    parser = OpenRouterStreamParser(
        "openai/gpt-4o"
    )

    line = (
        'data: {"id":"stream-openrouter-001",'
        '"choices":[{"index":0,"delta":'
        '{"role":"assistant","content":"Hello"},'
        '"finish_reason":null}]}'
    )

    chunk = parser.parse_line(line)

    assert chunk is not None
    assert chunk.provider == "openrouter"
    assert chunk.model == "openai/gpt-4o"
    assert chunk.content == "Hello"
    assert not chunk.done

    done = parser.parse_line("data: [DONE]")

    assert done is not None
    assert done.done
    assert done.finish_reason == "stop"

    print("STREAM PARSER: PASS")


def test_tokenizer() -> None:
    tokenizer = OpenRouterTokenizer(
        "openai/gpt-4o"
    )

    count = tokenizer.count_text(
        "ModelNow automatically selects the best model."
    )

    assert count > 0

    messages = [
        ChatMessage(
            role="user",
            content="Explain automatic routing.",
        )
    ]

    message_count = tokenizer.count_messages(
        messages
    )

    assert message_count > count

    print("TOKENIZER: PASS")


def test_model_parser() -> None:
    data = {
        "id": "openai/gpt-4o",
        "name": "GPT-4o",
        "context_length": 128000,
        "architecture": {
            "input": ["text", "image"],
            "output": ["text"],
        },
        "pricing": {
            "prompt": "0.0000025",
            "completion": "0.00001",
        },
        "top_provider": {
            "max_completion_tokens": 16384,
        },
        "supported_parameters": [
            "temperature",
            "tools",
            "response_format",
        ],
    }

    model = parse_model(data)

    assert model.id == "openai/gpt-4o"
    assert model.context_length == 128000
    assert model.max_output_tokens == 16384
    assert model.input_cost_per_1m_tokens == 2.5
    assert model.output_cost_per_1m_tokens == 10.0

    info = model.to_model_info()

    assert info.provider == "openrouter"
    assert info.context_window == 128000

    print("REMOTE MODEL PARSER: PASS")


async def test_lifecycle() -> None:
    provider = OpenRouterProvider(
        OpenRouterConfig(
            endpoint="https://openrouter.ai/api/v1",
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
    print("MODELNOW OPENROUTER INTEGRATION TEST")
    print("=" * 80)

    test_models()
    test_config()
    test_provider()
    await test_provider_models()
    test_payload()
    test_response_parser()
    test_stream_parser()
    test_tokenizer()
    test_model_parser()
    await test_lifecycle()

    print("=" * 80)
    print("PASS - OPENROUTER INTEGRATION TEST")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
