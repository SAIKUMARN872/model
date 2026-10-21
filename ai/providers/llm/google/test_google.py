from __future__ import annotations

import asyncio
import unittest

from ai.providers.base.request import (
    ChatMessage,
    ChatRequest,
    ToolDefinition,
)
from ai.providers.llm.google.chat import GoogleChat
from ai.providers.llm.google.config import GoogleConfig
from ai.providers.llm.google.models import (
    GOOGLE_MODELS,
    is_supported_model,
    list_models,
)
from ai.providers.llm.google.provider import GoogleProvider
from ai.providers.llm.google.stream import (
    GoogleStream,
    _parse_sse_events,
)
from ai.providers.llm.google.tokenizer import (
    GoogleTokenizer,
)
from ai.providers.llm.google.utils import (
    build_chat_payload,
    extract_content,
    extract_finish_reason,
    extract_request_id,
    extract_tool_calls,
    extract_usage,
)


class MockGoogleClient:
    def generate_content(
        self,
        model,
        payload,
    ):
        return {
            "responseId": "mock-google-001",
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
            'data: {"responseId":"mock-stream-001",'
            '"candidates":[{"content":{"role":"model",'
            '"parts":[{"text":"Hello "}]}}]}\n'
            '\n'
            'data: {"responseId":"mock-stream-001",'
            '"candidates":[{"content":{"role":"model",'
            '"parts":[{"text":"ModelNow"}]},'
            '"finishReason":"STOP"}],'
            '"usageMetadata":{"promptTokenCount":5,'
            '"candidatesTokenCount":3,'
            '"totalTokenCount":8}}\n'
            '\n'
            'data: [DONE]\n'
            '\n'
        )


class GoogleProviderTest(unittest.TestCase):

    def test_model_catalog(self):
        models = list_models()

        self.assertEqual(
            set(GOOGLE_MODELS),
            {
                "gemini-2.5-pro",
                "gemini-2.5-flash",
            },
        )

        self.assertEqual(
            len(models),
            2,
        )

        self.assertTrue(
            all(
                model.tier == "llm"
                for model in models
            )
        )

    def test_model_support(self):
        self.assertTrue(
            is_supported_model(
                "gemini-2.5-pro"
            )
        )

        self.assertTrue(
            is_supported_model(
                "gemini-2.5-flash"
            )
        )

        self.assertFalse(
            is_supported_model(
                "gemini-invalid"
            )
        )

    def test_provider_metadata(self):
        provider = GoogleProvider()

        metadata = provider.metadata

        self.assertEqual(
            provider.name,
            "google",
        )

        self.assertEqual(
            metadata.provider_id,
            "google",
        )

        self.assertEqual(
            metadata.display_name,
            "Google",
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
        provider = GoogleProvider(
            GoogleConfig(
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
            "google",
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
        tokenizer = GoogleTokenizer()

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
            model="gemini-2.5-flash",
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
            payload["contents"][0]["role"],
            "user",
        )

        self.assertEqual(
            payload["contents"][0]["parts"][0][
                "text"
            ],
            "Hello ModelNow",
        )

        self.assertEqual(
            payload["systemInstruction"]["parts"][0][
                "text"
            ],
            "You are ModelNow.",
        )

        self.assertEqual(
            payload["generationConfig"][
                "temperature"
            ],
            0.2,
        )

        self.assertEqual(
            payload["generationConfig"][
                "maxOutputTokens"
            ],
            100,
        )

    def test_payload_tools(self):
        request = ChatRequest(
            model="gemini-2.5-flash",
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

        declarations = payload["tools"][0][
            "functionDeclarations"
        ]

        self.assertEqual(
            declarations[0]["name"],
            "search",
        )

    def test_response_parsing(self):
        response = {
            "responseId": "google-response-001",
            "candidates": [
                {
                    "content": {
                        "role": "model",
                        "parts": [
                            {
                                "text": "Hello "
                            },
                            {
                                "text": "ModelNow"
                            },
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

        self.assertEqual(
            extract_content(response),
            "Hello ModelNow",
        )

        self.assertEqual(
            extract_finish_reason(response),
            "STOP",
        )

        self.assertEqual(
            extract_request_id(response),
            "google-response-001",
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
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "functionCall": {
                                    "name": "search",
                                    "args": {
                                        "query": "ModelNow"
                                    },
                                }
                            }
                        ]
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
            adapter = GoogleChat(
                MockGoogleClient()
            )

            request = ChatRequest(
                model="gemini-2.5-flash",
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
                "google",
            )

            self.assertEqual(
                response.model,
                "gemini-2.5-flash",
            )

            self.assertEqual(
                response.content,
                "Hello from Google Gemini mock.",
            )

            self.assertEqual(
                response.request_id,
                "mock-google-001",
            )

            self.assertEqual(
                response.finish_reason,
                "STOP",
            )

            self.assertEqual(
                response.usage.total_tokens,
                17,
            )

        asyncio.run(run())

    def test_stream_parser(self):
        raw = (
            'data: {"responseId":"stream-001",'
            '"candidates":[{"content":{"parts":'
            '[{"text":"Hello"}]}}]}\n'
            '\n'
            'data: {"responseId":"stream-001",'
            '"candidates":[{"content":{"parts":'
            '[{"text":" ModelNow"}]},'
            '"finishReason":"STOP"}]}\n'
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
            events[0]["responseId"],
            "stream-001",
        )

        self.assertEqual(
            events[2]["done"],
            True,
        )

    def test_stream_adapter(self):
        async def run():
            adapter = GoogleStream(
                MockGoogleClient()
            )

            request = ChatRequest(
                model="gemini-2.5-flash",
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
                "google",
            )

            stop_chunks = [
                chunk
                for chunk in chunks
                if chunk.finish_reason == "STOP"
            ]

            self.assertTrue(
                stop_chunks
            )

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()

