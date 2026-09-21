@'
from __future__ import annotations

from threading import RLock
from typing import Dict, Iterable, List, Set

from ..constants import ModelCapability
from ..models import ModelMetadata


class CapabilityRegistryError(Exception):
    """Base exception for capability registry failures."""


class CapabilityRegistry:
    """
    Production-grade capability index for ModelNow.

    Maps capabilities to models.

    Example:

        CHAT
          ├── GPT model
          ├── Claude model
          ├── Gemini model
          └── Llama model

        VISION
          ├── GPT vision model
          ├── Gemini vision model
          └── Qwen-VL

    This registry is an index.

    It does NOT decide which model should be used.

    Intelligent selection belongs to:
        routing_engine
        optimization_engine
        cost_engine
        quality_engine
    """

    def __init__(self) -> None:
        self._capabilities: Dict[
            ModelCapability,
            Set[str],
        ] = {}

        self._model_capabilities: Dict[
            str,
            Set[ModelCapability],
        ] = {}

        self._lock = RLock()

    # ------------------------------------------------------------------
    # Registration
    # ------------------------------------------------------------------

    def register_model(
        self,
        model: ModelMetadata,
    ) -> None:
        """
        Register all capabilities exposed by a model.
        """

        with self._lock:

            model_id = model.model_id

            old_capabilities = self._model_capabilities.get(
                model_id,
                set(),
            )

            # Remove stale indexes first.
            for capability in old_capabilities:
                models = self._capabilities.get(capability)

                if models is not None:
                    models.discard(model_id)

                    if not models:
                        self._capabilities.pop(
                            capability,
                            None,
                        )

            new_capabilities = set(model.capabilities)

            self._model_capabilities[model_id] = (
                new_capabilities
            )

            for capability in new_capabilities:
                self._capabilities.setdefault(
                    capability,
                    set(),
                ).add(model_id)

    def register_models(
        self,
        models: Iterable[ModelMetadata],
    ) -> None:
        for model in models:
            self.register_model(model)

    # ------------------------------------------------------------------
    # Lookup
    # ------------------------------------------------------------------

    def models_for(
        self,
        capability: ModelCapability,
    ) -> List[str]:
        """
        Return model IDs supporting a capability.
        """

        with self._lock:
            return sorted(
                self._capabilities.get(
                    capability,
                    set(),
                )
            )

    def capabilities_for(
        self,
        model_id: str,
    ) -> List[ModelCapability]:
        """
        Return capabilities supported by a model.
        """

        with self._lock:
            return sorted(
                self._model_capabilities.get(
                    model_id,
                    set(),
                ),
                key=lambda value: value.value,
            )

    def supports(
        self,
        model_id: str,
        capability: ModelCapability,
    ) -> bool:
        """
        Check whether a model supports a capability.
        """

        with self._lock:
            return model_id in self._capabilities.get(
                capability,
                set(),
            )

    # ------------------------------------------------------------------
    # Capability discovery
    # ------------------------------------------------------------------

    def all_capabilities(self) -> List[ModelCapability]:
        with self._lock:
            return sorted(
                self._capabilities.keys(),
                key=lambda value: value.value,
            )

    def count(
        self,
        capability: ModelCapability | None = None,
    ) -> int:
        """
        Return number of models supporting a capability.

        If capability is None, return number of
        registered capability types.
        """

        with self._lock:

            if capability is None:
                return len(self._capabilities)

            return len(
                self._capabilities.get(
                    capability,
                    set(),
                )
            )

    # ------------------------------------------------------------------
    # Removal
    # ------------------------------------------------------------------

    def remove_model(
        self,
        model_id: str,
    ) -> None:
        """
        Remove a model from every capability index.
        """

        with self._lock:

            capabilities = self._model_capabilities.pop(
                model_id,
                set(),
            )

            for capability in capabilities:

                models = self._capabilities.get(
                    capability
                )

                if models is None:
                    continue

                models.discard(model_id)

                if not models:
                    self._capabilities.pop(
                        capability,
                        None,
                    )

    def clear(self) -> None:
        with self._lock:
            self._capabilities.clear()
            self._model_capabilities.clear()

    # ------------------------------------------------------------------
    # Diagnostics
    # ------------------------------------------------------------------

    def snapshot(
        self,
    ) -> Dict[ModelCapability, Set[str]]:
        """
        Return a copy of the capability index.
        """

        with self._lock:
            return {
                capability: set(models)
                for capability, models
                in self._capabilities.items()
            }
'@ | Set-Content ".\ai\providers\registry\capability_registry.py" -Encoding UTF8