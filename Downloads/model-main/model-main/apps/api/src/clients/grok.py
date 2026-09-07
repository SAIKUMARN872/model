"""
Grok Client

Enterprise xAI Grok Client

Features
--------
- Async API
- Streaming
- Health Check
- Logging
- OpenAI Compatible
"""

from __future__ import annotations

from typing import Any

from openai import AsyncOpenAI

from config.logging import log
from config.settings import settings


class GrokClient:
    """
    xAI Grok Client
    """

    def __init__(self) -> None:
        self.client = AsyncOpenAI(
            api_key=settings.GROK_API_KEY,
            base_url="https://api.x.ai/v1",
        )

    # ---------------------------------------------------------
    # Chat Completion
    # ---------------------------------------------------------

    async def chat(
        self,
        *,
        model: str,
        messages: list[dict[str, Any]],
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> dict[str, Any]:
        """
        Generate chat completion.
        """

        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )

            message = response.choices[0].message

            return {
                "provider": "grok",
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
                "Grok request failed",
                error=str(exc),
            )
            raise

    # ---------------------------------------------------------
    # Streaming
    # ---------------------------------------------------------

    async def stream(
        self,
        *,
        model: str,
        messages: list[dict[str, Any]],
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ):
        """
        Stream chat response.
        """

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
                "Grok stream failed",
                error=str(exc),
            )
            raise

    # ---------------------------------------------------------
    # Health Check
    # ---------------------------------------------------------

    async def health(self) -> bool:
        """
        Verify API connectivity.
        """

        try:
            await self.client.chat.completions.create(
                model="grok-4",
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

    # ---------------------------------------------------------
    # Close
    # ---------------------------------------------------------

    async def close(self) -> None:
        """
        Close HTTP client.
        """

        await self.client.close()  