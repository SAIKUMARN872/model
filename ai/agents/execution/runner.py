from __future__ import annotations

import asyncio

from ai.agents import AgentRequest, AgentResponse, AgentStatus, BaseAgent
from ai.agents.exceptions import AgentExecutionError


class AgentRunner:
    """Runs one request against a registered agent instance."""

    def __init__(self, agent: BaseAgent, timeout_seconds: float = 60.0) -> None:
        if not isinstance(agent, BaseAgent):
            raise TypeError("agent must be a BaseAgent instance")
        if timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be greater than zero")

        self.agent = agent
        self.timeout_seconds = timeout_seconds

    async def run(self, request: AgentRequest) -> AgentResponse:
        try:
            return await asyncio.wait_for(
                self.agent.run(request),
                timeout=self.timeout_seconds,
            )
        except TimeoutError:
            return AgentResponse(
                agent_id=self.agent.agent_id,
                output="",
                status=AgentStatus.FAILED,
                task_id=request.task_id,
                error=f"Agent execution timed out after {self.timeout_seconds} seconds",
            )
        except Exception as exc:
            raise AgentExecutionError(
                f"Runner failed for agent '{self.agent.agent_id}': {exc}"
            ) from exc


__all__ = ["AgentRunner"]
