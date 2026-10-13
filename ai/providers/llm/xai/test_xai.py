from __future__ import annotations

import asyncio

from ai.providers.base.request import ChatMessage, ChatRequest

from .chat import XAIChat
from .client import XAIClient
from .config import XAIConfig
from .models import DEFAULT_XAI_MODELS, get_default_models
from .provider import XAIProvider
from .stream import XAIStreamParser
from .tokenizer import XAITokenizer
from .utils import (
    extract_content,
    extract_model,
    extract_request_id,
    extract_usage,
    is_grok_model,
    model_aliases,
    normalize_model_id,
    parse_sse_line,
    safe_json_loads,
)


def check(label: str, condition: bool) -> None:
    if not condition:
        raise AssertionError(label)

    print(f"{label}: PASS")


async def main() -> None:
    print("=" * 80)
    print("MODELNOW XAI INTEGRATION TEST")
    print("=" * 80)

    models = get_default_models()
    check("MODEL DISCOVERY", len(models) >= 3)

    config = XAIConfig.from_env()
    check("CONFIGURATION", config.provider_id == "xai")

    provider = XAIProvider(config)
    check("PROVIDER CONSTRUCTION", provider is not None)

    check(
        "MODEL MATCHING",
        provider.supports_model("grok-4.7"),
    )

    request = ChatRequest(
        model="grok-4.7",
        messages=[
            ChatMessage(
                role="user",
                content="Hello from ModelNow.",
            )
        ],
        temperature=0.2,
        max_tokens=32,
    )

    chat = XAIChat(
        XAIClient(config),
        config,
    )

    payload = chat.build_payload(request)

    check(
        "REQUEST PAYLOAD",
        payload["model"] == "grok-4.7"
        and len(payload["messages"]) == 1,
    )

    response_data = {
        "id": "test-xai-response",
        "model": "grok-4.7",
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "Hello from Grok.",
                },
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": 5,
            "completion_tokens": 4,
            "total_tokens": 9,
        },
    }

    check(
        "RESPONSE PARSER",
        extract_content(response_data) == "Hello from Grok.",
    )

    parser = XAIStreamParser(
        provider="xai",
        model="grok-4.7",
    )

    stream_chunk = parser.parse_line(
        'data: {"id":"stream-1","model":"grok-4.7","choices":[{"delta":{"content":"Hello"}}]}'
    )

    check(
        "STREAM PARSER",
        stream_chunk is not None
        and stream_chunk.content == "Hello",
    )

    tokenizer = XAITokenizer("grok-4.7")

    check(
        "TOKENIZER",
        tokenizer.count_tokens("Hello ModelNow") > 0,
    )

    remote_model = {
        "id": "grok-4.7",
        "context_length": 500000,
    }

    remote_info = provider.supports_model(
        remote_model["id"]
    )

    check(
        "REMOTE MODEL PARSER",
        remote_info is True,
    )

    await provider.initialize()
    check(
        "LIFECYCLE",
        provider.initialized is True,
    )

    await provider.close()

    print("=" * 80)
    print("PASS - XAI INTEGRATION TEST")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
