"""
AI Agent Factory.

Public entry point for creating agents in the Agent Platform.
"""

from __future__ import annotations

from threading import RLock
from typing import Any, Dict, Mapping, Optional

from .builder import AgentBuilder
from .loader import AgentLoader
from .models import (
    AgentConfig,
    AgentDefinition,
    AgentStatus,
    FactoryOptions,
    FactoryRequest,
    FactoryResult,
)


class AgentFactory:
    """
    Central factory for creating and managing AI agents.
    """

    def __init__(
        self,
        builder: Optional[AgentBuilder] = None,
        loader: Optional[AgentLoader] = None,
        options: Optional[FactoryOptions] = None,
    ) -> None:
        self.builder = builder or AgentBuilder()
        self.loader = loader or AgentLoader()
        self.options = options or FactoryOptions()

        self._instances: Dict[str, Any] = {}
        self._lock = RLock()

    def register(
        self,
        agent_type: str,
        agent_class: Any,
    ) -> None:
        """Register an agent implementation."""

        self.builder.register(
            agent_type,
            agent_class,
        )

    def create(
        self,
        request: FactoryRequest | AgentConfig,
    ) -> FactoryResult:
        """
        Create an agent from a FactoryRequest or AgentConfig.
        """

        if isinstance(request, AgentConfig):
            request = FactoryRequest(
                agent=request,
                validate=self.options.validate,
                initialize=self.options.initialize,
            )

        config = request.agent

        if not config.enabled:
            return FactoryResult(
                agent=None,
                agent_name=config.name,
                agent_type=config.agent_type,
                status=AgentStatus.STOPPED,
                model=config.model,
                errors=[
                    f"Agent '{config.name}' is disabled."
                ],
            )

        with self._lock:
            if (
                self.options.cache_instances
                and config.name in self._instances
            ):
                instance = self._instances[config.name]

                return FactoryResult(
                    agent=instance,
                    agent_name=config.name,
                    agent_type=config.agent_type,
                    status=AgentStatus.READY,
                    model=config.model,
                    metadata=dict(config.metadata),
                )

        if request.validate:
            self.validate(config)

        result = self.builder.build(config)

        if not result.success:
            return result

        if request.initialize:
            self._initialize(result)

        if (
            self.options.cache_instances
            and result.agent is not None
        ):
            with self._lock:
                self._instances[config.name] = result.agent

        return result

    def create_from_definition(
        self,
        definition: AgentDefinition,
    ) -> FactoryResult:
        """Create an agent from an AgentDefinition."""

        config = self.loader.to_config(definition)

        return self.create(config)

    def create_from_dict(
        self,
        data: Mapping[str, Any],
    ) -> FactoryResult:
        """Create an agent from a dictionary."""

        definition = self.loader.load(data)

        return self.create_from_definition(definition)

    def create_from_file(
        self,
        path: str,
    ) -> FactoryResult:
        """Create an agent from a JSON configuration file."""

        definition = self.loader.load_file(path)

        return self.create_from_definition(definition)

    def validate(
        self,
        config: AgentConfig,
    ) -> None:
        """Validate an agent configuration."""

        if not config.name:
            raise ValueError("Agent name is required.")

        agent_type = (
            config.agent_type.value
            if hasattr(config.agent_type, "value")
            else str(config.agent_type)
        )

        if not self.builder.supports(agent_type):
            raise ValueError(
                f"No implementation registered for "
                f"agent type '{agent_type}'."
            )

        if config.model is None:
            raise ValueError(
                f"Agent '{config.name}' requires a model."
            )

    def _initialize(
        self,
        result: FactoryResult,
    ) -> None:
        """Initialize the constructed agent if supported."""

        agent = result.agent

        if agent is None:
            return

        result.status = AgentStatus.INITIALIZING

        try:
            initialize = getattr(
                agent,
                "initialize",
                None,
            )

            if callable(initialize):
                initialize()

            result.status = AgentStatus.READY

        except Exception as exc:
            result.status = AgentStatus.FAILED
            result.errors.append(str(exc))

    def get(
        self,
        name: str,
    ) -> Any | None:
        """Return a cached agent instance."""

        with self._lock:
            return self._instances.get(name)

    def remove(
        self,
        name: str,
    ) -> Any | None:
        """Remove and return a cached agent."""

        with self._lock:
            return self._instances.pop(name, None)

    def clear(self) -> None:
        """Clear all cached agent instances."""

        with self._lock:
            self._instances.clear()

    @property
    def agents(self) -> Dict[str, Any]:
        """Return a snapshot of cached agents."""

        with self._lock:
            return dict(self._instances)