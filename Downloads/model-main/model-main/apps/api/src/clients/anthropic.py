"""
Anthropic Client

Enterprise AI Client

Features
--------
- Async API
- Streaming Support
- Retry Ready
- Type Safe
- Logging
"""

from __future__ import annotations

from typing import Any

from anthropic import AsyncAnthropic

from config.logging import log
from config.settings import settings


class AnthropicClient:
    """
    Anthropic API Client.
    """

    def __init__(self) -> None:
        self.client = AsyncAnthropic(
            api_key=settings.ANTHROPIC_API_KEY,
        )

    # ---------------------------------------------------------
    # Chat Completion
    # ---------------------------------------------------------

    async def chat(
        self,
        *,
        model: str,
        messages: list[dict[str, Any]],
        max_tokens: int = 1024,
        temperature: float = 0.7,
        system: str | None = None,
    ) -> dict[str, Any]:
        """
        Generate chat completion.
        """

        try:
            response = await self.client.messages.create(
                model=model,
                system=system,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )

            text = ""

            for block in response.content:
                if getattr(block, "text", None):
                    text += block.text

            return {
                "provider": "anthropic",
                "model": response.model,
                "content": text,
                "stop_reason": response.stop_reason,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                },
            }

        except Exception as exc:
            log.exception(
                "Anthropic request failed",
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
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ):
        """
        Stream model response.
        """

        async with self.client.messages.stream(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        ) as stream:

            async for text in stream.text_stream:
                yield text

    # ---------------------------------------------------------
    # Health Check
    # ---------------------------------------------------------

    async def health(self) -> bool:
        """
        Check API connectivity.
        """

        try:
            await self.client.models.list()

            return True

        except Exception:
            return False

    # ---------------------------------------------------------
    # Close
    # ---------------------------------------------------------

    async def close(self) -> None:
        """
        Close client.
        """

        await self.client.close() 