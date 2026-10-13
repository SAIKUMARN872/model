from __future__ import annotations

from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class AgentProtocol(Protocol):
    """Minimum execution contract accepted by the platform."""

    def execute(self, request: Any) -> Any:
        ...


@runtime_checkable
class AgentFactoryProtocol(Protocol):
    def create(self, metadata: Any, **kwargs: Any) -> AgentProtocol:
        ...


@runtime_checkable
class AgentRegistryProtocol(Protocol):
    def register(self, metadata: Any, agent: AgentProtocol) -> None:
        ...

    def get(self, agent_id: str) -> AgentProtocol:
        ...

    def get_metadata(self, agent_id: str) -> Any:
        ...

    def list_metadata(self) -> list[Any]:
        ...
