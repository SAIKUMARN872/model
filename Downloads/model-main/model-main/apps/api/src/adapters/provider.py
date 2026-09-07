"""
AI Provider Adapter

Enterprise AI Provider Adapter

Responsibilities
----------------
- Provider Selection
- Model Routing
- Health Check
- Unified Chat Interface
"""

from __future__ import annotations

from typing import Any

from clients.openai import OpenAIClient
from clients.anthropic import AnthropicClient
from clients.gemini import GeminiClient
from clients.grok import GrokClient

from config.logging import log


class ProviderAdapter:
    """
    Enterprise AI Provider Adapter.
    """

    def __init__(self) -> None:

        self.providers = {
            "openai": OpenAIClient(),
            "anthropic": AnthropicClient(),
            "gemini": GeminiClient(),
            "grok": GrokClient(),
        }

    # ==========================================================
    # Get Provider
    # ==========================================================

    def get_provider(self, provider: str):

        provider = provider.lower()

        if provider not in self.providers:
            raise ValueError(
                f"Unsupported provider: {provider}"
            )

        return self.providers[provider]

    # ==========================================================
    # Generate Chat Completion
    # ==========================================================

    async def chat(
        self,
        provider: str,
        messages: list[dict[str, Any]],
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:

        client = self.get_provider(provider)

        return await client.chat(
            messages=messages,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    # ==========================================================
    # Generate Embeddings
    # ==========================================================

    async def embeddings(
        self,
        provider: str,
        text: str,
        model: str,
    ):

        client = self.get_provider(provider)

        return await client.embeddings(
            text=text,
            model=model,
        )

    # ==========================================================
    # List Available Providers
    # ==========================================================

    def list_providers(self) -> list[str]:

        return list(self.providers.keys())

    # ==========================================================
    # Health Check
    # ==========================================================

    async def health(self) -> dict[str, bool]:

        status = {}

        for name, client in self.providers.items():

            try:

                status[name] = await client.health()

            except Exception as exc:

                log.exception(
                    f"{name} health check failed.",
                    error=str(exc),
                )

                status[name] = False

        return status

    # ==========================================================
    # Register New Provider
    # ==========================================================

    def register(
        self,
        name: str,
        provider: Any,
    ) -> None:

        self.providers[name.lower()] = provider

    # ==========================================================
    # Remove Provider
    # ==========================================================

    def unregister(
        self,
        name: str,
    ) -> None:

        self.providers.pop(
            name.lower(),
            None,
        ) 