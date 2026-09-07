"""
Model Factory

Responsible for creating and managing AI model instances.
Supports multiple providers like OpenAI, Anthropic,
Google Gemini, and local models.
"""

from typing import Any, Dict

from src.core.config import settings


class ModelFactory:
    """
    Factory class for AI model creation.
    """

    @staticmethod
    def create_model(
        provider: str,
        model_name: str | None = None,
        **kwargs: Any,
    ):
        """
        Create AI model based on provider.

        Args:
            provider:
                AI provider name
                (openai, anthropic, google, local)

            model_name:
                Model identifier

            kwargs:
                Additional model parameters

        Returns:
            Initialized model client
        """

        provider = provider.lower()

        if provider == "openai":
            return ModelFactory._create_openai_model(
                model_name,
                **kwargs
            )

        elif provider == "anthropic":
            return ModelFactory._create_anthropic_model(
                model_name,
                **kwargs
            )

        elif provider == "google":
            return ModelFactory._create_google_model(
                model_name,
                **kwargs
            )

        elif provider == "local":
            return ModelFactory._create_local_model(
                model_name,
                **kwargs
            )

        else:
            raise ValueError(
                f"Unsupported model provider: {provider}"
            )


    @staticmethod
    def _create_openai_model(
        model_name: str | None,
        **kwargs: Any,
    ):
        """
        Create OpenAI model.
        """

        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=model_name
            or settings.OPENAI_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=kwargs.get(
                "temperature",
                0.2
            ),
        )


    @staticmethod
    def _create_anthropic_model(
        model_name: str | None,
        **kwargs: Any,
    ):
        """
        Create Anthropic Claude model.
        """

        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model=model_name
            or "claude-3-5-sonnet",
            api_key=settings.ANTHROPIC_API_KEY,
            temperature=kwargs.get(
                "temperature",
                0.2
            ),
        )


    @staticmethod
    def _create_google_model(
        model_name: str | None,
        **kwargs: Any,
    ):
        """
        Create Google Gemini model.
        """

        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=model_name
            or settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=kwargs.get(
                "temperature",
                0.2
            ),
        )


    @staticmethod
    def _create_local_model(
        model_name: str | None,
        **kwargs: Any,
    ):
        """
        Create local HuggingFace model.
        """

        from langchain_community.llms import HuggingFacePipeline

        return HuggingFacePipeline.from_model_id(
            model_id=model_name,
            task="text-generation",
        ) 