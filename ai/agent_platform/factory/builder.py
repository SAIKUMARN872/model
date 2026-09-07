"""
Agent builder.

Responsible for constructing agent instances from validated
AgentConfig objects.
"""

from __future__ import annotations

from typing import Any, Callable, Dict, Optional

from .models import (
    AgentConfig,
    AgentStatus,
    FactoryResult,
)


class AgentBuilder:
    """
    Builds AI agents from configuration.

    Agent implementations are registered by agent type and then
    instantiated dynamically.
    """

    def __init__(
        self,
        agent_registry: Optional[Dict[str, Callable[..., Any]]] = None,
    ) -> None:
        self._registry: Dict[str, Callable[..., Any]] = (
            agent_registry or {}
        )

    def register(
        self,
        agent_type: str,
        agent_class: Callable[..., Any],
    ) -> None:
        """Register an agent implementation."""

        if not agent_type:
            raise ValueError("agent_type is required.")

        if not callable(agent_class):
            raise TypeError("agent_class must be callable.")

        self._registry[agent_type] = agent_class

    def unregister(self, agent_type: str) -> None:
        """Remove an agent implementation."""

        self._registry.pop(agent_type, None)

    def supports(self, agent_type: str) -> bool:
        """Return whether an agent type is registered."""

        return agent_type in self._registry

    def get_agent_class(
        self,
        agent_type: str,
    ) -> Callable[..., Any]:
        """Return the implementation registered for an agent type."""

        try:
            return self._registry[agent_type]
        except KeyError as exc:
            raise ValueError(
                f"Unsupported agent type: {agent_type}"
            ) from exc

    def build(
        self,
        config: AgentConfig,
    ) -> FactoryResult:
        """
        Build an agent from configuration.
        """

        agent_type = (
            config.agent_type.value
            if hasattr(config.agent_type, "value")
            else str(config.agent_type)
        )

        agent_class = self.get_agent_class(agent_type)

        kwargs: Dict[str, Any] = {
            "name": config.name,
            "model": config.model,
            "system_prompt": config.system_prompt,
            "tools": config.tools,
            "memory": config.memory,
            "metadata": dict(config.metadata),
        }

        if config.description is not None:
            kwargs["description"] = config.description

        kwargs.update(dict(config.extra))

        try:
            instance = agent_class(**kwargs)

            return FactoryResult(
                agent=instance,
                agent_name=config.name,
                agent_type=config.agent_type,
                status=AgentStatus.CREATED,
                model=config.model,
                metadata=dict(config.metadata),
            )

        except Exception as exc:
            return FactoryResult(
                agent=None,
                agent_name=config.name,
                agent_type=config.agent_type,
                status=AgentStatus.FAILED,
                model=config.model,
                metadata=dict(config.metadata),
                errors=[str(exc)],
            )

    @property
    def registry(self) -> Dict[str, Callable[..., Any]]:
        """Return a copy of the registered implementations."""

        return dict(self._registry)