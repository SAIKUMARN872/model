"""
Central agent manager.

Provides registration, lookup, lifecycle control and
execution management for multiple agents.
"""

from __future__ import annotations

import logging
from threading import RLock
from typing import Any, Dict, Iterable, Optional

from .lifecycle import AgentLifecycle, LifecycleState
from .utils import validate_agent_id

logger = logging.getLogger(__name__)


class AgentManagerError(RuntimeError):
    """Base exception for agent manager errors."""


class AgentAlreadyExistsError(AgentManagerError):
    """Raised when an agent ID is already registered."""


class AgentNotFoundError(AgentManagerError):
    """Raised when an agent cannot be found."""


class AgentManager:
    """Manage registered agents and their lifecycles."""

    def __init__(self):
        self._agents: Dict[str, Any] = {}
        self._lifecycles: Dict[str, AgentLifecycle] = {}
        self._lock = RLock()

    def register(
        self,
        agent_id: str,
        agent: Any,
        *,
        initialize: bool = True,
    ) -> Any:
        agent_id = validate_agent_id(agent_id)

        with self._lock:
            if agent_id in self._agents:
                raise AgentAlreadyExistsError(
                    f"Agent '{agent_id}' is already registered."
                )

            lifecycle = AgentLifecycle(agent)

            self._agents[agent_id] = agent
            self._lifecycles[agent_id] = lifecycle

            if initialize:
                lifecycle.initialize()

            logger.info("Registered agent: %s", agent_id)

            return agent

    def unregister(
        self,
        agent_id: str,
        *,
        stop: bool = True,
    ) -> Any:
        agent_id = validate_agent_id(agent_id)

        with self._lock:
            self._require_agent(agent_id)

            lifecycle = self._lifecycles[agent_id]

            if stop:
                lifecycle.stop()

            agent = self._agents.pop(agent_id)
            self._lifecycles.pop(agent_id)

            logger.info("Unregistered agent: %s", agent_id)

            return agent

    def get(self, agent_id: str) -> Any:
        agent_id = validate_agent_id(agent_id)

        with self._lock:
            self._require_agent(agent_id)
            return self._agents[agent_id]

    def lifecycle(self, agent_id: str) -> AgentLifecycle:
        agent_id = validate_agent_id(agent_id)

        with self._lock:
            self._require_agent(agent_id)
            return self._lifecycles[agent_id]

    def start(self, agent_id: str) -> Any:
        return self.lifecycle(agent_id).start()

    def stop(self, agent_id: str) -> Any:
        return self.lifecycle(agent_id).stop()

    def pause(self, agent_id: str) -> Any:
        return self.lifecycle(agent_id).pause()

    def resume(self, agent_id: str) -> Any:
        return self.lifecycle(agent_id).resume()

    def restart(self, agent_id: str) -> Any:
        return self.lifecycle(agent_id).restart()

    def initialize(self, agent_id: str) -> Any:
        return self.lifecycle(agent_id).initialize()

    def state(self, agent_id: str) -> LifecycleState:
        return self.lifecycle(agent_id).state

    def health(self, agent_id: str) -> Dict[str, Any]:
        return self.lifecycle(agent_id).health()

    def execute(
        self,
        agent_id: str,
        *args: Any,
        **kwargs: Any,
    ) -> Any:
        agent = self.get(agent_id)

        lifecycle = self.lifecycle(agent_id)

        if lifecycle.state != LifecycleState.RUNNING:
            lifecycle.start()

        method = getattr(agent, "run", None)

        if not callable(method):
            method = getattr(agent, "execute", None)

        if not callable(method):
            raise AgentManagerError(
                f"Agent '{agent_id}' does not provide "
                "'run' or 'execute'."
            )

        return method(*args, **kwargs)

    def list_agents(self) -> Iterable[str]:
        with self._lock:
            return tuple(self._agents.keys())

    def count(self) -> int:
        with self._lock:
            return len(self._agents)

    def clear(self, *, stop: bool = True) -> None:
        with self._lock:
            agent_ids = list(self._agents.keys())

            for agent_id in agent_ids:
                try:
                    self.unregister(agent_id, stop=stop)
                except Exception:
                    logger.exception(
                        "Failed to unregister agent: %s",
                        agent_id,
                    )

    def _require_agent(self, agent_id: str) -> None:
        if agent_id not in self._agents:
            raise AgentNotFoundError(
                f"Agent '{agent_id}' is not registered."
            )

    @property
    def agents(self) -> Dict[str, Any]:
        with self._lock:
            return dict(self._agents)

    @property
    def statuses(self) -> Dict[str, str]:
        with self._lock:
            return {
                agent_id: lifecycle.state.value
                for agent_id, lifecycle in self._lifecycles.items()
            }