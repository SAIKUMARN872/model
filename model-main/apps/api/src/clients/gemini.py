"""
Gemini Client

Enterprise Google Gemini Client

Features
--------
- Async API
- Streaming
- Health Check
- Logging
- Token Usage
"""

from __future__ import annotations

from typing import Any

from google import genai

from config.logging import log
from config.settings import settings


class GeminiClient:
    """
    Google Gemini Client.
    """

    def __init__(self) -> None:
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

    # ---------------------------------------------------------
    # Chat Completion
    # ---------------------------------------------------------

    async def chat(
        self,
        *,
        model: str,
        prompt: str,
        temperature: float = 0.7,
        max_output_tokens: int = 1024,
    ) -> dict[str, Any]:
        """
        Generate Gemini response.
        """

        try:
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,
                config={
                    "temperature": temperature,
                    "max_output_tokens": max_output_tokens,
                },
            )

            return {
                "provider": "gemini",
                "model": model,
                "content": response.text,
            }

        except Exception as exc:
            log.exception(
                "Gemini request failed",
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
        prompt: str,
    ):
        """
        Stream Gemini response.
        """

        try:
            stream = self.client.models.generate_content_stream(
                model=model,
                contents=prompt,
            )

            for chunk in stream:
                if chunk.text:
                    yield chunk.text

        except Exception as exc:
            log.exception(
                "Gemini stream failed",
                error=str(exc),
            )
            raise

    # ---------------------------------------------------------
    # Health Check
    # ---------------------------------------------------------

    async def health(self) -> bool:
        """
        Health check.
        """

        try:
            self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents="ping",
            )
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
        return None 