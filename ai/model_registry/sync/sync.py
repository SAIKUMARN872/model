from __future__ import annotations

from dataclasses import dataclass

from ..models import ModelRecord
from ..registry.manager import ModelRegistryManager
from ..validator.validator import ModelValidator
from .providers import ProviderCollection
from .utils import normalize_sync_models


@dataclass(frozen=True)
class SyncResult:
    """
    Result of synchronizing provider models into the canonical
    ModelNow registry.
    """

    discovered: int
    created: int
    updated: int
    unchanged: int

    @property
    def total_synced(self) -> int:
        return self.created + self.updated + self.unchanged


class ModelSynchronizer:
    """
    Synchronizes discovered provider models into the canonical
    ModelNow registry.

    Discovery finds models.
    Synchronization validates and upserts them.
    """

    def __init__(
        self,
        registry: ModelRegistryManager,
        providers: ProviderCollection,
        validator: ModelValidator | None = None,
    ) -> None:
        self.registry = registry
        self.providers = providers
        self.validator = validator or ModelValidator()

    def sync_provider(
        self,
        provider_name: str,
    ) -> SyncResult:
        provider_value = provider_name.strip().lower()

        provider = next(
            (
                item
                for item in self.providers.list()
                if item.provider.strip().lower()
                == provider_value
            ),
            None,
        )

        if provider is None:
            raise ValueError(
                f"Unknown sync provider: {provider_name}"
            )

        incoming = normalize_sync_models(
            provider.discover_models()
        )

        return self._sync_models(incoming)

    def sync_all(self) -> SyncResult:
        incoming: list[ModelRecord] = []

        for provider in self.providers.list():
            incoming.extend(
                provider.discover_models()
            )

        normalized = normalize_sync_models(
            incoming
        )

        return self._sync_models(normalized)

    def _sync_models(
        self,
        models: list[ModelRecord],
    ) -> SyncResult:
        created = 0
        updated = 0
        unchanged = 0

        for model in models:
            self.validator.validate(model)

            existing = self.registry.get(
                model.provider,
                model.model_id,
            )

            if existing is None:
                self.registry.register(model)
                created += 1
                continue

            if existing == model:
                unchanged += 1
                continue

            self.registry.upsert(model)
            updated += 1

        return SyncResult(
            discovered=len(models),
            created=created,
            updated=updated,
            unchanged=unchanged,
        )


__all__ = [
    "SyncResult",
    "ModelSynchronizer",
]
