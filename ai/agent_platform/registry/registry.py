from __future__ import annotations

from threading import RLock

from ..exceptions import AgentNotFoundError, AgentRegistrationError
from ..models import AgentMetadata
from ..utils import normalize_agent_id


class AgentRegistry:
    """Thread-safe in-memory registry for platform agents."""

    def __init__(self) -> None:
        self._agents: dict[str, object] = {}
        self._metadata: dict[str, AgentMetadata] = {}
        self._lock = RLock()

    def register(self, metadata: AgentMetadata, agent: object) -> None:
        if not isinstance(metadata, AgentMetadata):
            raise AgentRegistrationError(
                "metadata must be an AgentMetadata instance"
            )

        agent_id = normalize_agent_id(metadata.agent_id)

        if not callable(getattr(agent, "execute", None)):
            raise AgentRegistrationError(
                f"Agent '{agent_id}' must provide a callable execute method"
            )

        with self._lock:
            if agent_id in self._agents:
                raise AgentRegistrationError(
                    f"Agent '{agent_id}' is already registered"
                )

            self._agents[agent_id] = agent
            self._metadata[agent_id] = metadata

    def get(self, agent_id: str) -> object:
        key = normalize_agent_id(agent_id)
        with self._lock:
            if key not in self._agents:
                raise AgentNotFoundError(f"Agent '{key}' is not registered")
            return self._agents[key]

    def get_metadata(self, agent_id: str) -> AgentMetadata:
        key = normalize_agent_id(agent_id)
        with self._lock:
            if key not in self._metadata:
                raise AgentNotFoundError(f"Agent '{key}' is not registered")
            return self._metadata[key]

    def list_metadata(self, *, enabled_only: bool = False) -> list[AgentMetadata]:
        with self._lock:
            items = list(self._metadata.values())
            if enabled_only:
                items = [item for item in items if item.enabled]
            return sorted(items, key=lambda item: item.agent_id)

    def find_by_capability(self, capability: str) -> list[AgentMetadata]:
        target = capability.strip().casefold()
        if not target:
            return []

        with self._lock:
            matches = [
                metadata
                for metadata in self._metadata.values()
                if metadata.enabled
                and any(
                    item.casefold() == target
                    for item in metadata.capabilities
                )
            ]
            return sorted(matches, key=lambda item: item.agent_id)

    def set_enabled(self, agent_id: str, enabled: bool) -> AgentMetadata:
        if not isinstance(enabled, bool):
            raise TypeError("enabled must be a boolean")

        key = normalize_agent_id(agent_id)
        with self._lock:
            if key not in self._metadata:
                raise AgentNotFoundError(f"Agent '{key}' is not registered")
            self._metadata[key].enabled = enabled
            return self._metadata[key]

    def unregister(self, agent_id: str) -> AgentMetadata:
        key = normalize_agent_id(agent_id)
        with self._lock:
            if key not in self._agents:
                raise AgentNotFoundError(f"Agent '{key}' is not registered")

            del self._agents[key]
            return self._metadata.pop(key)

    def contains(self, agent_id: str) -> bool:
        key = normalize_agent_id(agent_id)
        with self._lock:
            return key in self._agents

    def __len__(self) -> int:
        with self._lock:
            return len(self._agents)
