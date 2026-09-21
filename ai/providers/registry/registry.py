@'
from __future__ import annotations

from typing import Iterable, List, Optional

from ..constants import ModelCapability, ProviderTier
from ..models import ModelMetadata, ProviderMetadata
from .capability_registry import CapabilityRegistry
from .model_registry import ModelRegistry
from .provider_registry import ProviderRegistry
from .validators import RegistryValidator


class AIRegistry:
    """
    Unified ModelNow AI registry.

    Centralizes:

        Provider Registry
        Model Registry
        Capability Registry

    Responsibilities are deliberately limited to metadata
    registration and discovery.

    Routing, optimization and inference remain outside
    this component.
    """

    def __init__(
        self,
        provider_registry: Optional[ProviderRegistry] = None,
        model_registry: Optional[ModelRegistry] = None,
        capability_registry: Optional[CapabilityRegistry] = None,
    ) -> None:

        self.providers = (
            provider_registry
            or ProviderRegistry()
        )

        self.models = (
            model_registry
            or ModelRegistry()
        )

        self.capabilities = (
            capability_registry
            or CapabilityRegistry()
        )

    # --------------------------------------------------------------
    # Providers
    # --------------------------------------------------------------

    def register_provider(
        self,
        provider: ProviderMetadata,
    ) -> None:

        RegistryValidator.validate_provider(
            provider
        )

        self.providers.register(
            provider
        )

        for model in provider.models:
            self.register_model(
                model,
                overwrite=True,
            )

    # --------------------------------------------------------------
    # Models
    # --------------------------------------------------------------

    def register_model(
        self,
        model: ModelMetadata,
        *,
        overwrite: bool = False,
    ) -> None:

        RegistryValidator.validate_model(
            model
        )

        self.models.register(
            model,
            overwrite=overwrite,
        )

        self.capabilities.register_model(
            model
        )

    def register_models(
        self,
        models: Iterable[ModelMetadata],
        *,
        overwrite: bool = False,
    ) -> int:

        models = list(models)

        RegistryValidator.validate_models(
            models
        )

        count = 0

        for model in models:

            self.register_model(
                model,
                overwrite=overwrite,
            )

            count += 1

        return count

    def remove_model(
        self,
        model_id: str,
    ) -> None:

        self.models.remove(
            model_id
        )

        self.capabilities.remove_model(
            model_id
        )

    # --------------------------------------------------------------
    # Discovery
    # --------------------------------------------------------------

    def find_models(
        self,
        *,
        provider_id: Optional[str] = None,
        tier: Optional[ProviderTier] = None,
        capability: Optional[ModelCapability] = None,
        enabled_only: bool = True,
    ) -> List[ModelMetadata]:

        return self.models.search(
            provider_id=provider_id,
            tier=tier,
            capability=capability,
            enabled_only=enabled_only,
        )

    def supports(
        self,
        model_id: str,
        capability: ModelCapability,
    ) -> bool:

        return self.capabilities.supports(
            model_id,
            capability,
        )

    # --------------------------------------------------------------
    # Diagnostics
    # --------------------------------------------------------------

    def health_snapshot(self) -> dict:

        return {
            "providers": self.providers.count(),
            "models": self.models.count(),
            "enabled_models": self.models.count(
                enabled_only=True
            ),
            "capabilities": self.capabilities.count(),
        }
'@ | Set-Content ".\ai\providers\registry\registry.py" -Encoding UTF8