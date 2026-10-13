from __future__ import annotations

import asyncio

from ai.providers.base.config import ProviderConfig
from ai.providers.base.request import (
    ChatMessage,
    ChatRequest,
)

from .config import AWSBedrockConfig
from .models import (
    AWSBedrockModel,
    model_from_bedrock_summary,
)
from .provider import AWSBedrockProvider
from .stream import AWSBedrockStreamParser
from .utils import (
    extract_response_text,
    parse_response,
    request_to_converse_payload,
)


def banner() -> None:
    print("=" * 80)
    print("MODELNOW AWS BEDROCK INTEGRATION TEST")
    print("=" * 80)


def test_model_discovery() -> None:
    provider = AWSBedrockProvider()

    models = asyncio.run(
        provider.list_models()
    )

    assert models
    assert any(
        model.provider == "aws_bedrock"
        for model in models
    )

    print("MODEL DISCOVERY: PASS")


def test_configuration() -> None:
    config = AWSBedrockConfig(
        region="us-east-1",
        timeout_seconds=60,
        connect_timeout_seconds=10,
        max_retries=3,
        retry_enabled=True,
        enabled=True,
    )

    assert config.region == "us-east-1"
    assert config.timeout_seconds == 60
    assert config.max_retries == 3
    assert config.enabled is True

    print("CONFIGURATION: PASS")


def test_provider_construction() -> None:
    provider = AWSBedrockProvider(
        ProviderConfig(
            provider_id="aws_bedrock"
        )
    )

    assert provider.name == "aws_bedrock"
    assert provider.client is not None
    assert provider.chat_client is not None
    assert provider.tokenizer is not None

    print("PROVIDER CONSTRUCTION: PASS")


def test_model_matching() -> None:
    provider = AWSBedrockProvider()

    assert provider.supports_model(
        "amazon.nova-micro-v1:0"
    )

    assert provider.supports_model(
        "nova-micro"
    )

    assert not provider.supports_model(
        "model-that-does-not-exist"
    )

    print("MODEL MATCHING: PASS")


def test_request_payload() -> None:
    request = ChatRequest(
        model="amazon.nova-micro-v1:0",
        messages=[
            ChatMessage(
                role="system",
                content="You are helpful.",
            ),
            ChatMessage(
                role="user",
                content="Hello Bedrock",
            ),
        ],
        temperature=0.2,
        max_tokens=100,
        top_p=0.9,
    )

    payload = request_to_converse_payload(
        request
    )

    assert payload["modelId"] == (
        "amazon.nova-micro-v1:0"
    )

    assert payload["messages"][0][
        "role"
    ] == "user"

    assert payload["messages"][0][
        "content"
    ][0]["text"] == "Hello Bedrock"

    assert payload["system"][0]["text"] == (
        "You are helpful."
    )

    assert payload["inferenceConfig"][
        "maxTokens"
    ] == 100

    assert payload["inferenceConfig"][
        "temperature"
    ] == 0.2

    assert payload["inferenceConfig"][
        "topP"
    ] == 0.9

    print("REQUEST PAYLOAD: PASS")


def test_response_parser() -> None:
    response = {
        "output": {
            "message": {
                "role": "assistant",
                "content": [
                    {
                        "text": "Hello from Bedrock"
                    }
                ],
            }
        },
        "stopReason": "end_turn",
        "usage": {
            "inputTokens": 10,
            "outputTokens": 5,
            "totalTokens": 15,
        },
    }

    parsed = parse_response(
        response=response,
        model="amazon.nova-micro-v1:0",
        request_id="test-request",
    )

    assert parsed.provider == "aws_bedrock"
    assert parsed.model == (
        "amazon.nova-micro-v1:0"
    )
    assert parsed.content == (
        "Hello from Bedrock"
    )
    assert parsed.finish_reason == "end_turn"
    assert parsed.request_id == "test-request"
    assert parsed.usage.input_tokens == 10
    assert parsed.usage.output_tokens == 5
    assert parsed.usage.total_tokens == 15

    assert extract_response_text(
        response
    ) == "Hello from Bedrock"

    print("RESPONSE PARSER: PASS")


def test_stream_parser() -> None:
    parser = AWSBedrockStreamParser(
        model="amazon.nova-micro-v1:0",
        request_id="stream-test",
    )

    start = parser.parse_event(
        {
            "messageStart": {
                "role": "assistant"
            }
        }
    )

    assert start is not None
    assert start.provider == "aws_bedrock"

    delta = parser.parse_event(
        {
            "contentBlockDelta": {
                "contentBlockIndex": 0,
                "delta": {
                    "text": "Hello"
                },
            }
        }
    )

    assert delta is not None
    assert delta.content == "Hello"

    stop = parser.parse_event(
        {
            "messageStop": {
                "stopReason": "end_turn"
            }
        }
    )

    assert stop is not None
    assert stop.done is True
    assert stop.finish_reason == "end_turn"

    metadata = parser.parse_event(
        {
            "metadata": {
                "usage": {
                    "inputTokens": 10,
                    "outputTokens": 5,
                    "totalTokens": 15,
                },
                "metrics": {
                    "latencyMs": 123,
                },
            }
        }
    )

    assert metadata is not None
    assert metadata.usage is not None
    assert metadata.usage.total_tokens == 15

    print("STREAM PARSER: PASS")


def test_tokenizer() -> None:
    provider = AWSBedrockProvider()

    tokenizer = provider.tokenizer

    count = tokenizer.count_text(
        "Hello Bedrock world!"
    )

    assert count > 0

    messages = [
        ChatMessage(
            role="user",
            content="Hello Bedrock",
        ),
        ChatMessage(
            role="assistant",
            content="Hello!",
        ),
    ]

    message_count = tokenizer.count_messages(
        messages
    )

    assert message_count > 0

    encoded = tokenizer.encode(
        "Hello world"
    )

    assert encoded

    print("TOKENIZER: PASS")


def test_remote_model_parser() -> None:
    summary = {
        "modelId": (
            "amazon.nova-micro-v1:0"
        ),
        "modelName": "Amazon Nova Micro",
        "inputModalities": [
            "TEXT"
        ],
        "outputModalities": [
            "TEXT"
        ],
        "responseStreamingSupported": True,
        "modelLifecycle": {
            "status": "ACTIVE"
        },
    }

    model = model_from_bedrock_summary(
        summary
    )

    assert model is not None
    assert isinstance(
        model,
        AWSBedrockModel,
    )
    assert model.id == (
        "amazon.nova-micro-v1:0"
    )
    assert model.enabled is True

    print("REMOTE MODEL PARSER: PASS")


async def test_lifecycle() -> None:
    provider = AWSBedrockProvider(
        AWSBedrockConfig(
            region="us-east-1",
            enabled=True,
        )
    )

    assert provider.initialized is False

    await provider.initialize()

    assert provider.initialized is True

    await provider.close()

    assert provider.initialized is False

    print("LIFECYCLE: PASS")


def main() -> None:
    banner()

    test_model_discovery()
    test_configuration()
    test_provider_construction()
    test_model_matching()
    test_request_payload()
    test_response_parser()
    test_stream_parser()
    test_tokenizer()
    test_remote_model_parser()

    asyncio.run(
        test_lifecycle()
    )

    print("=" * 80)
    print("PASS - AWS BEDROCK INTEGRATION TEST")
    print("=" * 80)


if __name__ == "__main__":
    main()
