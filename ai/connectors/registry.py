"""Thread-safe registry for connector implementations."""

from __future__ import annotations

from threading import RLock

from .connector import Connector
from .exceptions import ConnectorNotFoundError


class ConnectorRegistry:
    def __init__(self) -> None:
        self._connectors: dict[str, Connector] = {}
        self._lock = RLock()

    def register(self, connector: Connector) -> Connector:
        if not isinstance(connector, Connector):
            raise TypeError("connector must inherit from Connector.")

        name = connector.metadata.name
        with self._lock:
            if name in self._connectors:
                raise ValueError(f"Connector '{name}' is already registered.")
            self._connectors[name] = connector
        return connector

    def get(self, name: str) -> Connector:
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Connector name must be non-empty.")
        with self._lock:
            connector = self._connectors.get(name)
        if connector is None:
            raise ConnectorNotFoundError(f"Connector '{name}' is not registered.")
        return connector

    def list_connectors(self) -> list[Connector]:
        with self._lock:
            return [
                self._connectors[name] for name in sorted(self._connectors)
            ]

    def unregister(self, name: str) -> bool:
        with self._lock:
            return self._connectors.pop(name, None) is not None

    def __len__(self) -> int:
        with self._lock:
            return len(self._connectors)
