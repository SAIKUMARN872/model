@'
from __future__ import annotations

from threading import RLock
from typing import Dict, Iterable, List, Optional

from ..constants import (
    ModelCapability,
    ProviderStatus,
    ProviderTier,
)
from ..models import ModelMetadata


class ModelRegistryError(Exception):
    """Base exception for model registry failures."""


class ModelAlreadyRegisteredError(ModelRegistryError):
    """Raised when a model is registered more than once."""


class ModelNotFoundError(ModelRegistryError):
    """Raised when a requested model does not exist."""


class ModelRegistry:
    """
    Production-grade in-memory model registry for ModelNow.

    Responsibilities
    ----------------
    - Register AI model metadata.
    - Resolve models by ID.
    - Query models by provider.
    - Query models by tier.
    - Query models by capability.
    - Filter disabled models.
    - Filter models belonging to unavailable providers.
    - Support deterministic model selection upstream.
    - Provide thread-safe registry operations.

    Important
    ---------
    This registry stores metadata only.

    It does NOT perform:
        - model routing
        - cost optimization
        - latency optimization
        - inference
        - provider API calls

    Those responsibilities belong to:
        routing_engine
        optimization_engine
        cost_engine
        provider engine
    """

    def __init__(self) -> None:
        self._models: Dict[str, ModelMetadata] = {}
        self._lock = RLock()

    # ------------------------------------------------------------------
    # Registration
    # ------------------------------------------------------------------

    def register(
        self,
        model: ModelMetadata,
        *,
        overwrite: bool = False,
    ) -> ModelMetadata:
        """
        Register a model.

        Parameters
        ----------
        model:
            Model metadata.

        overwrite:
            If False, duplicate registration raises an error.
            If True, existing metadata is replaced.

        Returns
        -------
        ModelMetadata
        """

        if not model.model_id:
            raise ValueError("model.model_id cannot be empty.")

        if not model.provider:
            raise ValueError("model.provider cannot be empty.")

        with self._lock:
            if model.model_id in self._models and not overwrite:
                raise ModelAlreadyRegisteredError(
                    f"Model '{model.model_id}' is already registered."
                )

            self._models[model.model_id] = model

        return model

    def register_many(
        self,
        models: Iterable[ModelMetadata],
        *,
        overwrite: bool = False,
    ) -> int:
        """
        Register multiple models.

        Returns the number of successfully registered models.
        """

        count = 0

        for model in models:
            self.register(
                model,
                overwrite=overwrite,
            )
            count += 1

        return count

    # ------------------------------------------------------------------
    # Lookup
    # ------------------------------------------------------------------

    def get(
        self,
        model_id: str,
    ) -> Optional[ModelMetadata]:
        """
        Return a model if registered, otherwise None.
        """

        with self._lock:
            return self._models.get(model_id)

    def require(
        self,
        model_id: str,
    ) -> ModelMetadata:
        """
        Return a model or raise ModelNotFoundError.
        """

        model = self.get(model_id)

        if model is None:
            raise ModelNotFoundError(
                f"Model '{model_id}' is not registered."
            )

        return model

    def exists(
        self,
        model_id: str,
    ) -> bool:
        with self._lock:
            return model_id in self._models

    # ------------------------------------------------------------------
    # Query
    # ------------------------------------------------------------------

    def all(
        self,
        *,
        enabled_only: bool = False,
    ) -> List[ModelMetadata]:
        """
        Return all registered models.
        """

        with self._lock:
            models = list(self._models.values())

        if enabled_only:
            models = [
                model
                for model in models
                if model.enabled
            ]

        return models

    def by_provider(
        self,
        provider_id: str,
        *,
        enabled_only: bool = True,
    ) -> List[ModelMetadata]:
        """
        Return all models belonging to a provider.
        """

        models = self.all(
            enabled_only=enabled_only,
        )

        return [
            model
            for model in models
            if model.provider == provider_id
        ]

    def by_tier(
        self,
        tier: ProviderTier,
        *,
        enabled_only: bool = True,
    ) -> List[ModelMetadata]:
        """
        Return models belonging to SLM, MLM or LLM tier.
        """

        models = self.all(
            enabled_only=enabled_only,
        )

        return [
            model
            for model in models
            if model.tier == tier
        ]

    def by_capability(
        self,
        capability: ModelCapability,
        *,
        enabled_only: bool = True,
    ) -> List[ModelMetadata]:
        """
        Return models supporting a specific capability.
        """

        models = self.all(
            enabled_only=enabled_only,
        )

        return [
            model
            for model in models
            if capability in model.capabilities
        ]

    def search(
        self,
        *,
        provider_id: Optional[str] = None,
        tier: Optional[ProviderTier] = None,
        capability: Optional[ModelCapability] = None,
        enabled_only: bool = True,
        max_context_window: Optional[int] = None,
        min_quality_score: Optional[float] = None,
    ) -> List[ModelMetadata]:
        """
        Flexible model discovery API.

        This method intentionally performs filtering only.

        Ranking and optimization should happen inside
        ModelNow's routing/optimization layers.
        """

        models = self.all(
            enabled_only=enabled_only,
        )

        result: List[ModelMetadata] = []

        for model in models:

            if provider_id is not None:
                if model.provider != provider_id:
                    continue

            if tier is not None:
                if model.tier != tier:
                    continue

            if capability is not None:
                if capability not in model.capabilities:
                    continue

            if max_context_window is not None:
                if model.context_window > max_context_window:
                    continue

            if min_quality_score is not None:
                if model.quality_score < min_quality_score:
                    continue

            result.append(model)

        return result

    # ------------------------------------------------------------------
    # State management
    # ------------------------------------------------------------------

    def enable(
        self,
        model_id: str,
    ) -> None:
        model = self.require(model_id)
        model.enabled = True

    def disable(
        self,
        model_id: str,
    ) -> None:
        model = self.require(model_id)
        model.enabled = False

    def remove(
        self,
        model_id: str,
    ) -> None:
        with self._lock:
            if model_id not in self._models:
                raise ModelNotFoundError(
                    f"Model '{model_id}' is not registered."
                )

            del self._models[model_id]

    def clear(self) -> None:
        with self._lock:
            self._models.clear()

    # ------------------------------------------------------------------
    # Statistics
    # ------------------------------------------------------------------

    def count(
        self,
        *,
        enabled_only: bool = False,
    ) -> int:
        return len(
            self.all(
                enabled_only=enabled_only,
            )
        )

    def providers(self) -> List[str]:
        """
        Return unique provider IDs represented in the registry.
        """

        with self._lock:
            return sorted(
                {
                    model.provider
                    for model in self._models.values()
                }
            )

    def tiers(self) -> List[ProviderTier]:
        """
        Return unique model tiers.
        """

        with self._lock:
            return sorted(
                {
                    model.tier
                    for model in self._models.values()
                },
                key=lambda value: value.value,
            )

    # ------------------------------------------------------------------
    # Snapshot
    # ------------------------------------------------------------------

    def snapshot(self) -> Dict[str, ModelMetadata]:
        """
        Return a shallow snapshot of the registry.

        The returned dictionary can be inspected without
        holding the registry lock.
        """

        with self._lock:
            return dict(self._models)
'@ | Set-Content ".\ai\providers\registry\model_registry.py" -Encoding UTF8