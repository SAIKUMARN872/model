"""
Provider Factory

Creates and manages external service providers.

Examples:
- AI Providers
- Storage Providers
- Database Providers
- Message Queue Providers
"""

from typing import Any, Dict

from src.exceptions.validation.py import ValidationException


class ProviderFactory:
    """
    Factory responsible for creating provider instances.
    """

    _providers: Dict[str, Any] = {}

    @classmethod
    def register_provider(
        cls,
        name: str,
        provider: Any,
    ) -> None:
        """
        Register a provider instance.

        Example:
            ProviderFactory.register_provider(
                "openai",
                OpenAIProvider()
            )
        """

        cls._providers[name.lower()] = provider


    @classmethod
    def get_provider(
        cls,
        name: str,
    ) -> Any:
        """
        Retrieve registered provider.
        """

        provider = cls._providers.get(
            name.lower()
        )

        if not provider:
            raise ValidationException(
                message=f"Provider '{name}' not found"
            )

        return provider


    @classmethod
    def create_provider(
        cls,
        provider_type: str,
        **config: Any,
    ) -> Any:
        """
        Dynamically create providers.

        Supported providers:
        - openai
        - google
        - anthropic
        - aws
        - redis
        """

        provider_type = provider_type.lower()


        if provider_type == "openai":
            return cls._create_openai_provider(
                **config
            )


        elif provider_type == "google":
            return cls._create_google_provider(
                **config
            )


        elif provider_type == "anthropic":
            return cls._create_anthropic_provider(
                **config
            )


        elif provider_type == "aws":
            return cls._create_aws_provider(
                **config
            )


        elif provider_type == "redis":
            return cls._create_redis_provider(
                **config
            )


        else:
            raise ValidationException(
                message=(
                    f"Unsupported provider: "
                    f"{provider_type}"
                )
            )


    @staticmethod
    def _create_openai_provider(
        **config
    ):
        """
        OpenAI provider creation.
        """

        from src.providers.ai.openai import OpenAIProvider

        return OpenAIProvider(
            **config
        )


    @staticmethod
    def _create_google_provider(
        **config
    ):
        """
        Google Gemini provider creation.
        """

        from src.providers.ai.google import GoogleProvider

        return GoogleProvider(
            **config
        )


    @staticmethod
    def _create_anthropic_provider(
        **config
    ):
        """
        Anthropic provider creation.
        """

        from src.providers.ai.anthropic import AnthropicProvider

        return AnthropicProvider(
            **config
        )


    @staticmethod
    def _create_aws_provider(
        **config
    ):
        """
        AWS services provider.
        """

        from src.providers.storage.aws import AWSProvider

        return AWSProvider(
            **config
        )


    @staticmethod
    def _create_redis_provider(
        **config
    ):
        """
        Redis queue/cache provider.
        """

        from src.providers.cache.redis import RedisProvider

        return RedisProvider(
            **config
        ) 