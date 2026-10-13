from __future__ import annotations

from .constants import EnterpriseDomain
from .enterprise import EnterpriseAgent
from .exceptions import EnterpriseValidationError
from .registry import EnterpriseAgentRegistry


class EnterpriseAgentFactory:
    """Construct and optionally register domain-specific agent classes."""

    @staticmethod
    def create(
        agent_class: type[EnterpriseAgent],
        agent_id: str,
        domain: EnterpriseDomain,
        registry: EnterpriseAgentRegistry | None = None,
        name: str | None = None,
    ) -> EnterpriseAgent:
        if not isinstance(agent_class, type) or not issubclass(agent_class, EnterpriseAgent):
            raise EnterpriseValidationError(
                "agent_class must be an EnterpriseAgent subclass."
            )
        agent = agent_class(agent_id=agent_id, domain=domain, name=name)
        if registry is not None:
            registry.register(agent)
        return agent
