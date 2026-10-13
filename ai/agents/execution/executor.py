from __future__ import annotations

from collections.abc import Sequence

from ai.agents import AgentRequest, AgentResponse, BaseAgent
from ai.agents.exceptions import AgentExecutionError
from .runner import AgentRunner


class AgentExecutor:
    """Reusable entry point for executing agent requests."""

    def __init__(self, timeout_seconds: float = 60.0) -> None:
        if timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be greater than zero")
        self.timeout_seconds = timeout_seconds

    async def execute(
        self,
        agent: BaseAgent,
        request: AgentRequest,
    ) -> AgentResponse:
        return await AgentRunner(
            agent=agent,
            timeout_seconds=self.timeout_seconds,
        ).run(request)

    async def execute_many(
        self,
        agent: BaseAgent,
        requests: Sequence[AgentRequest],
        max_concurrency: int = 4,
    ) -> list[AgentResponse]:
        """Execute requests concurrently against one agent, sequentially per instance."""
        if max_concurrency < 1:
            raise ValueError("max_concurrency must be at least one")

        # A BaseAgent instance has mutable lifecycle state, so concurrent calls
        # on the same instance are unsafe. Serialize calls to that instance.
        results: list[AgentResponse] = []
        for request in requests:
            result = await self.execute(agent, request)
            results.append(result)
        return results


__all__ = ["AgentExecutor"]
