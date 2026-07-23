"""
AI Interface

Defines the contract for AI providers.

Implemented by:
- OpenAI Provider
- Google Gemini Provider
- Anthropic Claude Provider
- Local LLM Provider
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class IAIProvider(ABC):
    """
    Abstract AI provider interface.
    """


    @abstractmethod
    async def generate(
        self,
        prompt: str,
        **kwargs: Any,
    ) -> str:
        """
        Generate response from AI model.

        Args:
            prompt:
                User input prompt

        Returns:
            Generated text response
        """
        pass



    @abstractmethod
    async def chat(
        self,
        messages: List[Dict[str, str]],
        **kwargs: Any,
    ) -> str:
        """
        Chat completion interface.

        Example:
        [
            {
                "role": "user",
                "content": "Hello"
            }
        ]
        """
        pass



    @abstractmethod
    async def embed(
        self,
        text: str,
        **kwargs: Any,
    ) -> List[float]:
        """
        Generate embeddings.

        Used for:
        - RAG
        - Vector databases
        - Semantic search
        """
        pass



    @abstractmethod
    async def health_check(
        self,
    ) -> Dict[str, Any]:
        """
        Check AI provider availability.
        """
        pass



    @abstractmethod
    def get_model_name(
        self,
    ) -> str:
        """
        Return active model name.
        """
        pass 