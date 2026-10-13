from __future__ import annotations

import asyncio
import unittest

from ai.providers.base.request import (
    ChatMessage,
    ChatRequest,
    ToolDefinition,
)
from ai.providers.llm.mistral.chat import MistralChat
from ai.providers.llm.mistral.config import MistralConfig
from ai.providers.llm.mistral.models import (
    MISTRAL_MODELS,
    is_supported_model,
    list_models,
)
from ai.providers.llm.mistral.provider import MistralProvider
from ai.providers.llm.mistral.stream import (
    MistralStream,
    _parse_sse_events,
)
from ai.providers.llm.mistral.tokenizer import (
    MistralTokenizer,
)
from ai.providers.llm.mistral.utils import (
    build_chat_payload,
    extract_content,
    extract_finish_reason,
    extract_request_id,
    extract_tool_calls,
    extract_usage,
)


class MockMistralClient:
    def chat_completions(self, payload):
        return {
            "id": "mock-mistral-001",
            "object": "chat.completion",
            "model": "mistral-large-latest",
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
            '"delta":{"content":"Mistral"},'
            '"finish_reason":"stop"}],'
            '"usage":{"prompt_tokens":5,'
            '"completion_tokens":3,'
            '"total_tokens":8}}\n'
            '\n'
            'data: [DONE]\n'
            '\n'
        )


class MistralProviderTest(unittest.TestCase):
    def test_model_catalog(self):
        models = list_models()

        self.assertEqual(
            set(MISTRAL_MODELS),
            {
                "mistral-large-latest",
                "mistral-medium-latest",
            },
        )

        self.assertEqual(len(models), 2)

        self.assertTrue(
            all(
                model.tier == "llm"
                for model in models
            )
        )

    def test_model_support(self):
        self.assertTrue(
            is_supported_model(
                "mistral-large-latest"
            )
        )

        self.assertTrue(
            is_supported_model(
                "mistral-medium-latest"
            )
        )

        self.assertFalse(
            is_supported_model(
                "mistral-invalid"
            )
        )

    def test_provider_metadata(self):
        provider = MistralProvider()

        metadata = provider.metadata

        self.assertEqual(
            provider.name,
            "mistral",
        )

        self.assertEqual(
            metadata.provider_id,
            "mistral",
        )

        self.assertEqual(
            metadata.display_name,
            "Mistral",
        )

        self.assertTrue(
            metadata.streaming_supported
        )

        self.assertTrue(
            metadata.tool_use_supported
        )

        self.assertTrue(
            metadata.enterprise_ready
        )

    def test_lifecycle_without_api_key(self):
        provider = MistralProvider(
            MistralConfig(
                api_key=None
            )
        )

        self.assertFalse(
            provider.initialized
        )

        asyncio.run(
            provider.initialize()
        )

        self.assertTrue(
            provider.initialized
        )

        health = asyncio.run(
            provider.health_check()
        )

        self.assertFalse(
            health.healthy
        )

        self.assertEqual(
            health.provider,
            "mistral",
        )

        self.assertEqual(
            health.status.value,
            "unavailable",
        )

        asyncio.run(
            provider.close()
        )

        self.assertFalse(
            provider.initialized
        )

    def test_tokenizer(self):
        tokenizer = MistralTokenizer()

        self.assertEqual(
            tokenizer.estimate_text(""),
            0,
        )

        self.assertEqual(
            tokenizer.estimate_text(
                "Hello ModelNow"
            ),
            3,
        )

        messages = [
            ChatMessage(
                role="user",
                content="Hello ModelNow",
            )
        ]

        self.assertEqual(
            tokenizer.estimate_messages(
                messages
            ),
            3,
        )

    def test_payload_conversion(self):
        request = ChatRequest(
            model="mistral-large-latest",
            messages=[
                ChatMessage(
                    role="system",
                    content="You are ModelNow.",
                ),
                ChatMessage(
                    role="user",
                    content="Hello ModelNow",
                ),
            ],
            temperature=0.2,
            max_tokens=100,
            top_p=0.9,
            stream=True,
        )

        payload = build_chat_payload(
            request
        )

        self.assertEqual(
            payload["model"],
            "mistral-large-latest",
        )

        self.assertEqual(
            payload["messages"][0]["role"],
            "system",
        )

        self.assertEqual(
            payload["messages"][1]["role"],
            "user",
        )

        self.assertEqual(
            payload["messages"][1]["content"],
            "Hello ModelNow",
        )

        self.assertEqual(
            payload["temperature"],
            0.2,
        )

        self.assertEqual(
            payload["max_tokens"],
            100,
        )

        self.assertEqual(
            payload["top_p"],
            0.9,
        )

        self.assertTrue(
            payload["stream"]
        )

    def test_payload_tools(self):
        request = ChatRequest(
            model="mistral-large-latest",
            messages=[
                ChatMessage(
                    role="user",
                    content="Search for ModelNow.",
                )
            ],
            tools=[
                ToolDefinition(
                    name="search",
                    description="Search the web.",
                    parameters={
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string"
                            }
                        },
                    },
                )
            ],
        )

        payload = build_chat_payload(
            request
        )

        self.assertIn(
            "tools",
            payload,
        )

        self.assertEqual(
            payload["tools"][0]["type"],
            "function",
        )

        self.assertEqual(
            payload["tools"][0]["function"]["name"],
            "search",
        )

    def test_response_parsing(self):
        response = {
            "id": "mistral-response-001",
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": (
                            "Hello ModelNow"
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

        self.assertEqual(
            extract_content(response),
            "Hello ModelNow",
        )

        self.assertEqual(
            extract_finish_reason(response),
            "stop",
        )

        self.assertEqual(
            extract_request_id(response),
            "mistral-response-001",
        )

        usage = extract_usage(
            response
        )

        self.assertEqual(
            usage["input_tokens"],
            10,
        )

        self.assertEqual(
            usage["output_tokens"],
            7,
        )

        self.assertEqual(
            usage["total_tokens"],
            17,
        )

    def test_tool_call_parsing(self):
        response = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": None,
                        "tool_calls": [
                            {
                                "id": "call-001",
                                "type": "function",
                                "function": {
                                    "name": "search",
                                    "arguments": (
                                        '{"query":"ModelNow"}'
                                    ),
                                },
                            }
                        ],
                    }
                }
            ]
        }

        tool_calls = extract_tool_calls(
            response
        )

        self.assertEqual(
            len(tool_calls),
            1,
        )

        self.assertEqual(
            tool_calls[0]["type"],
            "function",
        )

        self.assertEqual(
            tool_calls[0]["function"]["name"],
            "search",
        )

    def test_chat_adapter(self):
        async def run():
            adapter = MistralChat(
                MockMistralClient()
            )

            request = ChatRequest(
                model="mistral-large-latest",
                messages=[
                    ChatMessage(
                        role="user",
                        content="Hello ModelNow",
                    )
                ],
            )

            response = await adapter.create(
                request
            )

            self.assertEqual(
                response.provider,
                "mistral",
            )

            self.assertEqual(
                response.model,
                "mistral-large-latest",
            )

            self.assertEqual(
                response.content,
                "Hello from Mistral mock.",
            )

            self.assertEqual(
                response.request_id,
                "mock-mistral-001",
            )

            self.assertEqual(
                response.finish_reason,
                "stop",
            )

            self.assertEqual(
                response.usage.total_tokens,
                17,
            )

        asyncio.run(run())

    def test_stream_parser(self):
        raw = (
            'data: {"id":"stream-001",'
            '"choices":[{"delta":'
            '{"content":"Hello"},'
            '"finish_reason":null}]}\n'
            '\n'
            'data: {"id":"stream-001",'
            '"choices":[{"delta":'
            '{"content":" ModelNow"},'
            '"finish_reason":"stop"}]}\n'
            '\n'
            'data: [DONE]\n'
            '\n'
        )

        events = _parse_sse_events(
            raw
        )

        self.assertEqual(
            len(events),
            3,
        )

        self.assertEqual(
            events[0]["id"],
            "stream-001",
        )

        self.assertEqual(
            events[2]["done"],
            True,
        )

    def test_stream_adapter(self):
        async def run():
            adapter = MistralStream(
                MockMistralClient()
            )

            request = ChatRequest(
                model="mistral-large-latest",
                messages=[
                    ChatMessage(
                        role="user",
                        content="Hello",
                    )
                ],
                stream=True,
            )

            chunks = []

            async for chunk in adapter.stream(
                request
            ):
                chunks.append(chunk)

            self.assertGreaterEqual(
                len(chunks),
                2,
            )

            self.assertEqual(
                chunks[0].content,
                "Hello ",
            )

            self.assertEqual(
                chunks[0].provider,
                "mistral",
            )

            stop_chunks = [
                chunk
                for chunk in chunks
                if chunk.finish_reason == "stop"
            ]

            self.assertTrue(
                stop_chunks
            )

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
