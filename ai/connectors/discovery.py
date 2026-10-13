"""Discover connector capabilities without executing provider operations."""

from __future__ import annotations

from typing import Any

from .registry import ConnectorRegistry


class ConnectorDiscovery:
    def __init__(self, registry: ConnectorRegistry) -> None:
        if not isinstance(registry, ConnectorRegistry):
            raise TypeError("registry must be a ConnectorRegistry.")
        self.registry = registry

    def list_capabilities(self) -> list[dict[str, Any]]:
        return [
            {
                "name": connector.metadata.name,
                "version": connector.metadata.version,
                "description": connector.metadata.description,
                "operations": list(connector.metadata.operations),
                "required_permissions": list(
                    connector.metadata.required_permissions
                ),
            }
            for connector in self.registry.list_connectors()
        ]
