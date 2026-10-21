from __future__ import annotations

from threading import RLock

from .constants import EnterpriseDomain
from .enterprise import EnterpriseAgent
from .exceptions import EnterpriseAgentNotFoundError, EnterpriseValidationError


class EnterpriseAgentRegistry:
    def __init__(self) -> None:
        self._agents: dict[EnterpriseDomain, EnterpriseAgent] = {}
        self._lock = RLock()

    def register(self, agent: EnterpriseAgent) -> EnterpriseAgent:
        if not isinstance(agent, EnterpriseAgent):
            raise TypeError("agent must be an EnterpriseAgent.")
        with self._lock:
            if agent.domain in self._agents:
                raise EnterpriseValidationError(
                    f"An agent for '{agent.domain.value}' is already registered."
                )
            self._agents[agent.domain] = agent
        return agent

    def get(self, domain: EnterpriseDomain | str) -> EnterpriseAgent:
        try:
            key = domain if isinstance(domain, EnterpriseDomain) else EnterpriseDomain(domain)
        except (ValueError, TypeError) as exc:
            raise EnterpriseAgentNotFoundError(
                f"Unknown enterprise domain: {domain}"
            ) from exc
        with self._lock:
            agent = self._agents.get(key)
        if agent is None:
            raise EnterpriseAgentNotFoundError(
                f"No agent registered for '{key.value}'."
            )
        return agent

    def list_agents(self) -> list[EnterpriseAgent]:
        with self._lock:
            return list(self._agents.values())

    def unregister(self, domain: EnterpriseDomain | str) -> bool:
        try:
            key = domain if isinstance(domain, EnterpriseDomain) else EnterpriseDomain(domain)
        except (ValueError, TypeError):
            return False
        with self._lock:
            return self._agents.pop(key, None) is not None
