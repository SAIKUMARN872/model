"""
AI Services.

Provides a unified interface for interacting with multiple
LLM providers (OpenAI, Anthropic, Gemini, Groq, Ollama, etc.).
"""

from __future__ import annotations

from typing import Any

from app.providers.provider_factory import ProviderFactory
from app.schemas.chat import ChatRequest, ChatResponse


class AIService:
    """
    High-level AI service.

    Routes requests to the configured AI provider.
    """

    def __init__(
        self,
        provider_factory: ProviderFactory | None = None,
    ) -> None:
        self._factory = provider_factory or ProviderFactory()

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        """
        Generate a chat completion.
        """

        provider = self._factory.get_provider(
            model=request.model,
        )

        return await provider.chat(request)

    async def stream_chat(
        self,
        request: ChatRequest,
    ):
        """
        Stream chat completion.
        """

        provider = self._factory.get_provider(
            model=request.model,
        )

        async for chunk in provider.stream_chat(request):
            yield chunk

    async def embeddings(
        self,
        text: str,
        *,
        model: str | None = None,
    ) -> list[float]:
        """
        Generate embeddings.
        """

        provider = self._factory.get_provider(
            model=model,
        )

        return await provider.embeddings(text)

    async def list_models(self) -> list[dict[str, Any]]:
        """
        List available AI models.
        """

        return await self._factory.list_models()

    async def health(self) -> dict[str, Any]:
        """
        Health status of all providers.
        """

        return await self._factory.health()

    async def count_tokens(
        self,
        text: str,
        *,
        model: str | None = None,
    ) -> int:
        """
        Count tokens for a model.
        """

        provider = self._factory.get_provider(
            model=model,
        )

        return await provider.count_tokens(text)

    async def moderate(
        self,
        text: str,
    ) -> dict[str, Any]:
        """
        Moderate user input.
        """

        provider = self._factory.get_default_provider()

        return await provider.moderate(text)

    async def rerank(
        self,
        query: str,
        documents: list[str],
    ) -> list[int]:
        """
        Rerank documents.
        """

        provider = self._factory.get_default_provider()

        return await provider.rerank(
            query=query,
            documents=documents,
        ) 