from __future__ import annotations

import asyncio
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock

from providers.base.config import ProviderConfig
from providers.base.request import ChatMessage, ChatRequest
from providers.llm.openai.client import OpenAIClient
from providers.llm.openai.config import OpenAIConfig
from providers.llm.openai.stream import OpenAIStream


class TestOpenAIMockStream(unittest.TestCase):

    def test_mock_stream(self) -> None:
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
                stream=True,
            )

            events = [
                SimpleNamespace(
                    type="response.created",
                    response=SimpleNamespace(
                        id="mock-openai-stream-001"
                    ),
                ),
                SimpleNamespace(
                    type="response.output_text.delta",
                    delta="ModelNow ",
                ),
                SimpleNamespace(
                    type="response.output_text.delta",
                    delta="is an ",
                ),
                SimpleNamespace(
                    type="response.output_text.delta",
                    delta="enterprise AI ",
                ),
                SimpleNamespace(
                    type="response.output_text.delta",
                    delta="orchestration platform.",
                ),
                SimpleNamespace(
                    type="response.completed",
                    response=SimpleNamespace(
                        id="mock-openai-stream-001",
                        usage=SimpleNamespace(
                            input_tokens=14,
                            output_tokens=11,
                            total_tokens=25,
                        ),
                    ),
                ),
            ]

            async def mock_response_stream():
                for event in events:
                    yield event

            config = ProviderConfig(
                provider_id="openai",
                api_key="mock-test-key",
            )

            openai_config = OpenAIConfig(
                api_key="mock-test-key",
            )

            client = OpenAIClient(
                config=config,
                openai_config=openai_config,
            )

            stream_client = OpenAIStream(client)

            client.request = AsyncMock(
                return_value=mock_response_stream()
            )

            chunks = []

            async for chunk in stream_client.stream(request):
                chunks.append(chunk)

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
            print(f"STREAM CHUNKS: {len(chunks)}")

            for index, chunk in enumerate(chunks, start=1):
                if chunk.done:
                    print(f"CHUNK {index}: [DONE]")
                else:
                    print(f"CHUNK {index}: {chunk.content}")

            final_chunk = chunks[-1]

            print(f"PROVIDER: {final_chunk.provider}")
            print(f"MODEL: {final_chunk.model}")
            print(f"REQUEST ID: {final_chunk.request_id}")
            print(f"FINAL DONE: {final_chunk.done}")

            self.assertEqual(len(chunks), 5)

            self.assertEqual(
                "".join(
                    chunk.content
                    for chunk in chunks
                    if not chunk.done
                ),
                "ModelNow is an enterprise AI orchestration platform.",
            )

            self.assertEqual(
                final_chunk.provider,
                "openai",
            )

            self.assertEqual(
                final_chunk.model,
                "gpt-4o-mini",
            )

            self.assertEqual(
                final_chunk.request_id,
                "mock-openai-stream-001",
            )

            self.assertTrue(final_chunk.done)
            self.assertEqual(
                final_chunk.finish_reason,
                "completed",
            )

            self.assertIsNotNone(final_chunk.usage)
            self.assertEqual(
                final_chunk.usage.input_tokens,
                14,
            )
            self.assertEqual(
                final_chunk.usage.output_tokens,
                11,
            )
            self.assertEqual(
                final_chunk.usage.total_tokens,
                25,
            )

            client.request.assert_awaited_once()

            call_kwargs = client.request.await_args.kwargs

            self.assertEqual(
                call_kwargs["method"],
                "POST",
            )
            self.assertEqual(
                call_kwargs["path"],
                "/responses",
            )

            payload = call_kwargs["json"]

            self.assertEqual(
                payload["model"],
                "gpt-4o-mini",
            )
            self.assertTrue(payload["stream"])

            await client.close()

        asyncio.run(run_test())


if __name__ == "__main__":
    unittest.main(verbosity=2)