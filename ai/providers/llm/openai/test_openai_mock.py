from __future__ import annotations

import asyncio
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from providers.base.config import ProviderConfig
from providers.base.request import ChatMessage, ChatRequest
from providers.base.response import ChatResponse, ChatUsage
from providers.llm.openai.config import OpenAIConfig
from providers.llm.openai.provider import OpenAIProvider


class TestOpenAIMockChat(unittest.TestCase):

    def test_mock_chat(self) -> None:
        async def run_test() -> None:
            request = ChatRequest(
                model="gpt-4o-mini",
                messages=[
                    ChatMessage(
                        role="user",
                        content="Explain ModelNow in one sentence.",
                    )
                ],
                temperature=0.2,
                max_tokens=100,
            )

            mock_response = SimpleNamespace(
                output_text="ModelNow is an enterprise AI orchestration platform.",
                id="mock-openai-response-001",
                usage=SimpleNamespace(
                    input_tokens=14,
                    output_tokens=11,
                    total_tokens=25,
                ),
                status="completed",
                output=[],
            )

            config = ProviderConfig(
                provider_id="openai",
                api_key="mock-test-key",
            )

            openai_config = OpenAIConfig(
                api_key="mock-test-key",
            )

            provider = OpenAIProvider(
                config=config,
                openai_config=openai_config,
            )

            await provider.initialize()

            provider.chat_client.create = AsyncMock(
                return_value=ChatResponse(
                    provider="openai",
                    model="gpt-4o-mini",
                    content=mock_response.output_text,
                    request_id=mock_response.id,
                    finish_reason="stop",
                    usage=ChatUsage(
                        input_tokens=14,
                        output_tokens=11,
                        total_tokens=25,
                    ),
                )
            )

            response = await provider.chat(request)

            print(f"REQUEST MODEL: {request.model}")
            print(
                "REQUEST MESSAGES:",
                [
                    {
                        "role": message.role,
                        "content": message.content,
                    }
                    for message in request.messages
                ],
            )
            print(f"REQUEST TEMPERATURE: {request.temperature}")
            print(f"REQUEST MAX TOKENS: {request.max_tokens}")
            print(f"RESPONSE TYPE: {type(response).__name__}")
            print(f"PROVIDER: {response.provider}")
            print(f"MODEL: {response.model}")
            print(f"CONTENT: {response.content}")
            print(f"INPUT TOKENS: {response.usage.input_tokens}")
            print(f"OUTPUT TOKENS: {response.usage.output_tokens}")
            print(f"TOTAL TOKENS: {response.usage.total_tokens}")
            print(f"FINISH REASON: {response.finish_reason}")
            print(f"REQUEST ID: {response.request_id}")

            self.assertIsInstance(response, ChatResponse)
            self.assertEqual(response.provider, "openai")
            self.assertEqual(response.model, "gpt-4o-mini")
            self.assertEqual(
                response.content,
                "ModelNow is an enterprise AI orchestration platform.",
            )
            self.assertEqual(response.usage.input_tokens, 14)
            self.assertEqual(response.usage.output_tokens, 11)
            self.assertEqual(response.usage.total_tokens, 25)
            self.assertEqual(response.finish_reason, "stop")
            self.assertEqual(response.request_id, "mock-openai-response-001")

            provider.chat_client.create.assert_awaited_once_with(request)

            await provider.close()

        asyncio.run(run_test())


if __name__ == "__main__":
    unittest.main(verbosity=2)
