@'
from __future__ import annotations

from typing import Any, Dict, Iterable, List

from ..constants import (
    ModelCapability,
    ProviderStatus,
    ProviderTier,
    ProviderType,
)
from ..models import ModelMetadata, ProviderMetadata
from .validators import RegistryValidator


class RegistryLoader:
    """
    Converts configuration dictionaries into strongly typed
    ModelNow registry metadata.

    The loader does not register anything itself.

    Flow:

        Configuration
              ↓
        RegistryLoader
              ↓
        Validation
              ↓
        ModelMetadata / ProviderMetadata
              ↓
        AIRegistry
    """

    # --------------------------------------------------------------
    # Model
    # --------------------------------------------------------------

    @classmethod
    def load_model(
        cls,
        data: Dict[str, Any],
    ) -> ModelMetadata:

        model = ModelMetadata(
            model_id=str(
                data["model_id"]
            ),

            provider=str(
                data["provider"]
            ),

            tier=cls._enum(
                ProviderTier,
                data["tier"],
            ),

            provider_type=cls._enum(
                ProviderType,
                data["provider_type"],
            ),

            context_window=int(
                data.get(
                    "context_window",
                    0,
                )
            ),

            max_output_tokens=int(
                data.get(
                    "max_output_tokens",
                    0,
                )
            ),

            input_cost_per_1m_tokens=float(
                data.get(
                    "input_cost_per_1m_tokens",
                    0.0,
                )
            ),

            output_cost_per_1m_tokens=float(
                data.get(
                    "output_cost_per_1m_tokens",
                    0.0,
                )
            ),

            average_latency_ms=float(
                data.get(
                    "average_latency_ms",
                    0.0,
                )
            ),

            quality_score=float(
                data.get(
                    "quality_score",
                    0.0,
                )
            ),

            capabilities=[
                cls._enum(
                    ModelCapability,
                    capability,
                )
                for capability in data.get(
                    "capabilities",
                    [],
                )
            ],

            enabled=bool(
                data.get(
                    "enabled",
                    True,
                )
            ),

            metadata=dict(
                data.get(
                    "metadata",
                    {},
                )
            ),
        )

        RegistryValidator.validate_model(
            model
        )

        return model

    @classmethod
    def load_models(
        cls,
        items: Iterable[Dict[str, Any]],
    ) -> List[ModelMetadata]:

        models = [
            cls.load_model(item)
            for item in items
        ]

        RegistryValidator.validate_models(
            models
        )

        return models

    # --------------------------------------------------------------
    # Provider
    # --------------------------------------------------------------

    @classmethod
    def load_provider(
        cls,
        data: Dict[str, Any],
    ) -> ProviderMetadata:

        models = cls.load_models(
            data.get(
                "models",
                [],
            )
        )

        provider = ProviderMetadata(
            provider_id=str(
                data["provider_id"]
            ),

            name=str(
                data["name"]
            ),

            provider_type=cls._enum(
                ProviderType,
                data["provider_type"],
            ),

            tier=(
                cls._enum(
                    ProviderTier,
                    data["tier"],
                )
                if data.get("tier") is not None
                else None
            ),

            status=cls._enum(
                ProviderStatus,
                data.get(
                    "status",
                    ProviderStatus.ACTIVE.value,
                ),
            ),

            models=models,

            supports_streaming=bool(
                data.get(
                    "supports_streaming",
                    False,
                )
            ),

            supports_tools=bool(
                data.get(
                    "supports_tools",
                    False,
                )
            ),

            priority=int(
                data.get(
                    "priority",
                    100,
                )
            ),

            metadata=dict(
                data.get(
                    "metadata",
                    {},
                )
            ),
        )

        RegistryValidator.validate_provider(
            provider
        )

        return provider

    @classmethod
    def load_providers(
        cls,
        items: Iterable[Dict[str, Any]],
    ) -> List[ProviderMetadata]:

        providers = [
            cls.load_provider(item)
            for item in items
        ]

        RegistryValidator.validate_providers(
            providers
        )

        return providers

    # --------------------------------------------------------------
    # Enum conversion
    # --------------------------------------------------------------

    @staticmethod
    def _enum(
        enum_type,
        value,
    ):

        if isinstance(
            value,
            enum_type,
        ):
            return value

        try:
            return enum_type(value)
        except ValueError as exc:
            valid_values = [
                member.value
                for member in enum_type
            ]

            raise ValueError(
                f"Invalid {enum_type.__name__} "
                f"value '{value}'. "
                f"Expected one of: {valid_values}"
            ) from exc
'@ | Set-Content ".\ai\providers\registry\loader.py" -Encoding UTF8