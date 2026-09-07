"""
Component discovery utilities.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from .metadata import ComponentMetadata
from .registry import ComponentRegistry


@dataclass
class DiscoveryQuery:
    """
    Query used to discover registered components.
    """

    component_type: Optional[str] = None

    provider: Optional[str] = None

    capability: Optional[str] = None

    tag: Optional[str] = None

    enabled_only: bool = True

    name_contains: Optional[str] = None


class ComponentDiscovery:
    """
    Search and discover components in a registry.
    """

    def __init__(
        self,
        registry: ComponentRegistry,
    ):
        self.registry = registry

    def search(
        self,
        query: Optional[
            DiscoveryQuery
        ] = None,
    ) -> List[str]:

        query = query or DiscoveryQuery()

        results = []

        for name in self.registry.list(
            component_type=query.component_type,
            enabled_only=query.enabled_only,
        ):

            metadata = (
                self.registry.get_metadata(name)
            )

            if (
                query.provider is not None
                and metadata.provider
                != query.provider
            ):
                continue

            if (
                query.capability is not None
                and query.capability
                not in metadata.capabilities
            ):
                continue

            if (
                query.tag is not None
                and query.tag
                not in metadata.tags
            ):
                continue

            if (
                query.name_contains is not None
                and query.name_contains.lower()
                not in name.lower()
            ):
                continue

            results.append(name)

        return results

    def find_by_type(
        self,
        component_type: str,
    ) -> List[str]:

        return self.search(
            DiscoveryQuery(
                component_type=component_type
            )
        )

    def find_by_provider(
        self,
        provider: str,
    ) -> List[str]:

        return self.search(
            DiscoveryQuery(
                provider=provider
            )
        )

    def find_by_capability(
        self,
        capability: str,
    ) -> List[str]:

        return self.search(
            DiscoveryQuery(
                capability=capability
            )
        )

    def find_by_tag(
        self,
        tag: str,
    ) -> List[str]:

        return self.search(
            DiscoveryQuery(
                tag=tag
            )
        )

    def find(
        self,
        name: str,
    ) -> Optional[Any]:

        if not self.registry.contains(name):
            return None

        return self.registry.get(name)

    def describe(
        self,
        name: str,
    ) -> Dict[str, Any]:

        metadata = (
            self.registry.get_metadata(name)
        )

        return metadata.to_dict()

    def discover(
        self,
        query: DiscoveryQuery,
    ) -> List[
        Dict[str, Any]
    ]:

        names = self.search(query)

        return [
            {
                "name": name,
                "metadata": (
                    self.registry
                    .get_metadata(name)
                    .to_dict()
                ),
            }
            for name in names
        ]