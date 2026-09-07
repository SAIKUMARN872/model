"""
OpenAI Client

Enterprise OpenAI Client

Features
--------
✓ GPT-5 Support
✓ GPT-5-mini Support
✓ Async API
✓ Streaming
✓ Embeddings
✓ Health Check
✓ Usage Tracking
✓ Structured Logging
"""

from __future__ import annotations

from typing import Any, AsyncGenerator

from openai import AsyncOpenAI

from config.logging import log
from config.settings import settings


class OpenAIClient:
    """
    Enterprise OpenAI Client.
    """

    def __init__(self) -> None:

        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
        )

    # ==========================================================
    # Chat Completion
    # ==========================================================

    async def chat(
        self,
        *,
        model: str,
        messages: list[dict[str, Any]],
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> dict[str, Any]:

        try:

            response = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )

            message = response.choices[0].message

            return {
                "provider": "openai",
                "model": response.model,
                "content": message.content,
                "finish_reason": response.choices[0].finish_reason,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
            }

        except Exception as exc:

            log.exception(
                "OpenAI request failed",
                error=str(exc),
            )

            raise

    # ==========================================================
    # Streaming
    # ==========================================================

    async def stream(
        self,
        *,
        model: str,
        messages: list[dict[str, Any]],
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncGenerator[str, None]:

        try:

            stream = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )

            async for chunk in stream:

                if chunk.choices:

                    delta = chunk.choices[0].delta

                    if delta.content:

                        yield delta.content

        except Exception as exc:

            log.exception(
                "OpenAI streaming failed",
                error=str(exc),
            )

            raise

    # ==========================================================
    # Embeddings
    # ==========================================================

    async def embedding(
        self,
        *,
        model: str = "text-embedding-3-small",
        input: str,
    ) -> list[float]:

        try:

            response = await self.client.embeddings.create(
                model=model,
                input=input,
            )

            return response.data[0].embedding

        except Exception as exc:

            log.exception(
                "Embedding generation failed",
                error=str(exc),
            )

            raise

    # ==========================================================
    # Health Check
    # ==========================================================

    async def health(self) -> bool:

        try:

            await self.client.chat.completions.create(
                model="gpt-5-mini",
                messages=[
                    {
                        "role": "user",
                        "content": "ping",
                    }
                ],
                max_tokens=5,
            )

            return True

        except Exception:

            return False

    # ==========================================================
    # Close
    # ==========================================================

    async def close(self) -> None:

        await self.client.close()

        log.info("OpenAI Client closed.") 