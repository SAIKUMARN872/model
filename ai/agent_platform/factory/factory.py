from __future__ import annotations

from collections.abc import Callable
from threading import RLock
from typing import Any

from ..exceptions import AgentRegistrationError
from ..models import AgentMetadata
from .builder import AgentBuilder


class AgentFactory:
    """Creates agents from explicitly registered constructors."""

    def __init__(self) -> None:
        self._builders: dict[str, AgentBuilder] = {}
        self._lock = RLock()

    def register_builder(
        self,
        factory_key: str,
        creator: Callable[..., Any],
        *,
        replace: bool = False,
    ) -> None:
        key = factory_key.strip()
        if not key:
            raise ValueError("factory_key cannot be empty")
        if not callable(creator):
            raise TypeError("creator must be callable")

        with self._lock:
            if key in self._builders and not replace:
                raise AgentRegistrationError(
                    f"Factory builder '{key}' is already registered"
                )
            self._builders[key] = AgentBuilder(creator)

    def unregister_builder(self, factory_key: str) -> None:
        key = factory_key.strip()
        with self._lock:
            if key not in self._builders:
                raise KeyError(f"Factory builder '{key}' is not registered")
            del self._builders[key]

    def create(self, metadata: AgentMetadata, **kwargs: Any) -> Any:
        if not isinstance(metadata, AgentMetadata):
            raise TypeError("metadata must be an AgentMetadata instance")
        if not metadata.enabled:
            raise AgentRegistrationError(
                f"Agent '{metadata.agent_id}' is disabled"
            )

        factory_key = str(
            metadata.extra.get("factory_key", metadata.agent_id)
        ).strip()
        if not factory_key:
            raise ValueError("metadata factory_key cannot be empty")

        with self._lock:
            builder = self._builders.get(factory_key)

        if builder is None:
            raise AgentRegistrationError(
                f"No factory builder registered for '{factory_key}'"
            )

        return builder.build(**kwargs)

    def has_builder(self, factory_key: str) -> bool:
        with self._lock:
            return factory_key.strip() in self._builders

    def list_builder_keys(self) -> list[str]:
        with self._lock:
            return sorted(self._builders)
