"""
Environment Validation

Responsible for validating runtime configuration before
the application starts.

Production Features
-------------------
- Environment Detection
- Required Secret Validation
- Fail Fast
- Immutable Runtime State
"""

from enum import StrEnum

from .settings import settings


class Environment(StrEnum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"


class EnvironmentManager:
    """Application environment manager."""

    def __init__(self) -> None:
        self.environment = Environment(settings.ENVIRONMENT)

    @property
    def is_development(self) -> bool:
        return self.environment is Environment.DEVELOPMENT

    @property
    def is_testing(self) -> bool:
        return self.environment is Environment.TESTING

    @property
    def is_staging(self) -> bool:
        return self.environment is Environment.STAGING

    @property
    def is_production(self) -> bool:
        return self.environment is Environment.PRODUCTION

    def validate(self) -> None:
        """
        Validate critical configuration.

        Raises
        ------
        RuntimeError
            If configuration is invalid.
        """

        if self.is_production:
            self._validate_production()

        self._validate_database()
        self._validate_ai()

    def _validate_production(self) -> None:
        if settings.DEBUG:
            raise RuntimeError(
                "DEBUG cannot be enabled in production."
            )

        if (
            settings.SECRET_KEY.get_secret_value()
            == "CHANGE_ME_IN_PRODUCTION"
        ):
            raise RuntimeError(
                "SECRET_KEY must be configured."
            )

    def _validate_database(self) -> None:
        if not settings.DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL is required."
            )

    def _validate_ai(self) -> None:
        providers = [
            settings.OPENAI_API_KEY,
            settings.ANTHROPIC_API_KEY,
            settings.GEMINI_API_KEY,
            settings.GROQ_API_KEY,
        ]

        if not any(providers):
            print(
                "Warning: No AI provider API key configured."
            )


environment = EnvironmentManager()  