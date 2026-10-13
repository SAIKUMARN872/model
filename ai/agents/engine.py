from __future__ import annotations

from collections.abc import Sequence

from .base.agent import BaseAgent
from .execution.executor import AgentExecutor
from .models import AgentRequest, AgentResponse
from .utils import normalize_identifier


class AgentEngine:
    """Central registry and execution entry point for ModelNow agents."""

    def __init__(self, executor: AgentExecutor | None = None) -> None:
        self._executor = executor or AgentExecutor()
        self._agents: dict[str, BaseAgent] = {}

    def register(self, agent: BaseAgent, *, replace: bool = False) -> BaseAgent:
        """Register an agent, rejecting duplicate IDs unless replacement is enabled."""
        if not isinstance(agent, BaseAgent):
            raise TypeError("agent must be a BaseAgent instance")

        agent_id = normalize_identifier(agent.agent_id)
        if not agent_id:
            raise ValueError("agent.agent_id must not be empty")

        if agent_id in self._agents and not replace:
            raise ValueError(f"Agent '{agent_id}' is already registered")

        self._agents[agent_id] = agent
        return agent

    def get_agent(self, agent_id: str) -> BaseAgent:
        """Retrieve a registered agent by ID."""
        normalized_id = normalize_identifier(agent_id)

        try:
            return self._agents[normalized_id]
        except KeyError:
            raise KeyError(
                f"Agent '{normalized_id}' is not registered"
            ) from None

    def unregister(self, agent_id: str) -> BaseAgent:
        """Remove and return a registered agent."""
        normalized_id = normalize_identifier(agent_id)

        try:
            return self._agents.pop(normalized_id)
        except KeyError:
            raise KeyError(
                f"Agent '{normalized_id}' is not registered"
            ) from None

    def list_agents(self) -> tuple[str, ...]:
        """Return registered agent IDs in deterministic order."""
        return tuple(sorted(agent.agent_id for agent in self._agents.values()))

    async def execute(
        self,
        agent_id: str,
        request: AgentRequest,
    ) -> AgentResponse:
        """Execute one request through the existing executor."""
        if not isinstance(request, AgentRequest):
            raise TypeError("request must be an AgentRequest instance")

        agent = self.get_agent(agent_id)
        return await self._executor.execute(agent, request)

    async def execute_many(
        self,
        agent_id: str,
        requests: Sequence[AgentRequest],
        *,
        max_concurrency: int = 4,
    ) -> list[AgentResponse]:
        """Execute multiple requests using the existing executor's safeguards."""
        if isinstance(requests, (str, bytes)):
            raise TypeError("requests must be a sequence of AgentRequest instances")

        if not all(isinstance(request, AgentRequest) for request in requests):
            raise TypeError("every item in requests must be an AgentRequest")

        agent = self.get_agent(agent_id)
        return await self._executor.execute_many(
            agent,
            requests,
            max_concurrency=max_concurrency,
        )


__all__ = ["AgentEngine"]
