from __future__ import annotations

from .registry import AgentRegistry


class AgentDiscovery:
    """Capability and identifier discovery over an AgentRegistry."""

    def __init__(self, registry: AgentRegistry) -> None:
        self._registry = registry

    def by_capability(self, capability: str):
        return self._registry.find_by_capability(capability)

    def all_agents(self, *, enabled_only: bool = False):
        return self._registry.list_metadata(enabled_only=enabled_only)

    def by_tag(self, tag: str):
        target = tag.strip().casefold()
        if not target:
            return []

        return [
            metadata
            for metadata in self._registry.list_metadata(enabled_only=True)
            if any(item.casefold() == target for item in metadata.tags)
        ]

    def exists(self, agent_id: str) -> bool:
        return self._registry.contains(agent_id)
