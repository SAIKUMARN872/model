import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock

from providers.llm.anthropic.chat import AnthropicChat
from providers.base.request import ChatMessage, ChatRequest
from providers.base.response import ChatResponse


class TestAnthropicMockChat(unittest.IsolatedAsyncioTestCase):

    async def test_mock_chat_success(self):
        mock_response = SimpleNamespace(
            id="msg_mock_anthropic_001",
            model="claude-sonnet-5",
            stop_reason="end_turn",
            content=[
                SimpleNamespace(
                    type="text",
                    text="ModelNow is an enterprise AI orchestration platform.",
                )
            ],
            usage=SimpleNamespace(
                input_tokens=120,
                output_tokens=45,
            ),
        )

        mock_client = SimpleNamespace(
            request=AsyncMock(return_value=mock_response)
        )

        chat = AnthropicChat(mock_client)

        request = ChatRequest(
            model="claude-sonnet-5",
            messages=[
                ChatMessage(
                    role="system",
                    content="You are a helpful ModelNow assistant.",
                ),
                ChatMessage(
                    role="user",
                    content="What is ModelNow?",
                ),
            ],
            max_tokens=256,
        )

        response = await chat.chat(request)

        self.assertIsInstance(response, ChatResponse)

        self.assertEqual(
            response.provider,
            "anthropic",
        )

        self.assertEqual(
            response.model,
            "claude-sonnet-5",
        )

        self.assertEqual(
            response.content,
            "ModelNow is an enterprise AI orchestration platform.",
        )

        self.assertEqual(
            response.finish_reason,
            "end_turn",
        )

        self.assertEqual(
            response.request_id,
            "msg_mock_anthropic_001",
        )

        self.assertEqual(
            response.usage.input_tokens,
            120,
        )

        self.assertEqual(
            response.usage.output_tokens,
            45,
        )

        self.assertEqual(
            response.usage.total_tokens,
            165,
        )

        self.assertGreaterEqual(
            response.latency_ms,
            0.0,
        )

        mock_client.request.assert_awaited_once()

    async def test_mock_chat_payload(self):
        mock_response = SimpleNamespace(
            id="msg_mock_anthropic_002",
            model="claude-sonnet-5",
            stop_reason="end_turn",
            content=[
                SimpleNamespace(
                    type="text",
                    text="Hello from Anthropic mock.",
                )
            ],
            usage=SimpleNamespace(
                input_tokens=10,
                output_tokens=5,
            ),
        )

        mock_request = AsyncMock(
            return_value=mock_response
        )

        mock_client = SimpleNamespace(
            request=mock_request
        )

        chat = AnthropicChat(mock_client)

        request = ChatRequest(
            model="claude-sonnet-5",
            messages=[
                ChatMessage(
                    role="system",
                    content="System instruction.",
                ),
                ChatMessage(
                    role="user",
                    content="Hello.",
                ),
                ChatMessage(
                    role="assistant",
                    content="Hi.",
                ),
            ],
            max_tokens=512,
        )

        await chat.chat(request)

        mock_request.assert_awaited_once()

        call = mock_request.await_args

        self.assertEqual(
            call.kwargs["method"],
            "POST",
        )

        self.assertEqual(
            call.kwargs["path"],
            "/messages",
        )

        payload = call.kwargs["json"]

        self.assertEqual(
            payload["model"],
            "claude-sonnet-5",
        )

        self.assertEqual(
            payload["max_tokens"],
            512,
        )

        self.assertEqual(
            payload["system"],
            "System instruction.",
        )

        self.assertEqual(
            payload["messages"],
            [
                {
                    "role": "user",
                    "content": "Hello.",
                },
                {
                    "role": "assistant",
                    "content": "Hi.",
                },
            ],
        )

    async def test_mock_chat_without_system_message(self):
        mock_response = SimpleNamespace(
            id="msg_mock_anthropic_003",
            model="claude-haiku-4-5-20251001",
            stop_reason="end_turn",
            content=[
                SimpleNamespace(
                    type="text",
                    text="Fast response.",
                )
            ],
            usage=SimpleNamespace(
                input_tokens=20,
                output_tokens=8,
            ),
        )

        mock_client = SimpleNamespace(
            request=AsyncMock(return_value=mock_response)
        )

        chat = AnthropicChat(mock_client)

        request = ChatRequest(
            model="claude-haiku-4-5-20251001",
            messages=[
                ChatMessage(
                    role="user",
                    content="Give me a short answer.",
                )
            ],
        )

        response = await chat.chat(request)

        self.assertEqual(
            response.content,
            "Fast response.",
        )

        payload = mock_client.request.await_args.kwargs["json"]

        self.assertNotIn(
            "system",
            payload,
        )

        self.assertEqual(
            payload["max_tokens"],
            4096,
        )

    async def test_mock_chat_tool_call(self):
        mock_response = SimpleNamespace(
            id="msg_mock_anthropic_tool_001",
            model="claude-sonnet-5",
            stop_reason="tool_use",
            content=[
                SimpleNamespace(
                    type="text",
                    text="I will use the requested tool.",
                ),
                SimpleNamespace(
                    type="tool_use",
                    id="toolu_mock_001",
                    name="browser_search",
                    input={
                        "query": "ModelNow"
                    },
                ),
            ],
            usage=SimpleNamespace(
                input_tokens=80,
                output_tokens=35,
            ),
        )

        mock_client = SimpleNamespace(
            request=AsyncMock(return_value=mock_response)
        )

        chat = AnthropicChat(mock_client)

        request = ChatRequest(
            model="claude-sonnet-5",
            messages=[
                ChatMessage(
                    role="user",
                    content="Search for ModelNow.",
                )
            ],
        )

        response = await chat.chat(request)

        self.assertEqual(
            response.finish_reason,
            "tool_use",
        )

        self.assertEqual(
            response.content,
            "I will use the requested tool.",
        )

        self.assertEqual(
            len(response.tool_calls),
            1,
        )

        self.assertEqual(
            response.tool_calls[0]["id"],
            "toolu_mock_001",
        )

        self.assertEqual(
            response.tool_calls[0]["name"],
            "browser_search",
        )

        self.assertEqual(
            response.tool_calls[0]["input"],
            {
                "query": "ModelNow"
            },
        )

    async def test_no_network_client_created(self):
        mock_client = SimpleNamespace(
            request=AsyncMock(
                return_value=SimpleNamespace(
                    id="msg_mock_004",
                    model="claude-haiku-4-5-20251001",
                    stop_reason="end_turn",
                    content=[
                        SimpleNamespace(
                            type="text",
                            text="Mock only.",
                        )
                    ],
                    usage=SimpleNamespace(
                        input_tokens=1,
                        output_tokens=1,
                    ),
                )
            )
        )

        chat = AnthropicChat(mock_client)

        request = ChatRequest(
            model="claude-haiku-4-5-20251001",
            messages=[
                ChatMessage(
                    role="user",
                    content="Test.",
                )
            ],
        )

        response = await chat.chat(request)

        self.assertEqual(
            response.content,
            "Mock only.",
        )

        mock_client.request.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()

