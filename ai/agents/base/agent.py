from __future__ import annotations

import asyncio

from abc import ABC, abstractmethod

from ..constants import AgentStatus
from ..exceptions import AgentExecutionError, AgentStateError
from ..models import AgentContext, AgentRequest, AgentResponse


class BaseAgent(ABC):
    """Base contract for ModelNow agents."""

    def __init__(self, agent_id: str, name: str | None = None) -> None:
        if not isinstance(agent_id, str) or not agent_id.strip():
            raise ValueError("agent_id must be a non-empty string")

        self.agent_id = agent_id
        self.name = name or agent_id
        self.status = AgentStatus.CREATED

    async def initialize(self) -> None:
        """Prepare the agent for execution."""
        if self.status not in (AgentStatus.CREATED, AgentStatus.READY):
            raise AgentStateError(
                f"Cannot initialize agent while status is {self.status.value}"
            )
        self.status = AgentStatus.READY

    async def run(self, request: AgentRequest) -> AgentResponse:
        """Execute a request and normalize execution failures."""
        if not isinstance(request, AgentRequest):
            raise TypeError("request must be an AgentRequest")

        if self.status == AgentStatus.CREATED:
            await self.initialize()

        if self.status != AgentStatus.READY:
            raise AgentStateError(
                f"Cannot run agent while status is {self.status.value}"
            )

        self.status = AgentStatus.RUNNING
        try:
            output = await self.execute(request, request.context)
            if not isinstance(output, str):
                raise AgentExecutionError("execute() must return a string")

            response = AgentResponse(
                agent_id=self.agent_id,
                output=output,
                status=AgentStatus.COMPLETED,
                task_id=request.task_id,
            )
            self.status = AgentStatus.READY
            return response
        except asyncio.CancelledError:
            self.status = AgentStatus.CANCELLED
            raise
        except Exception as exc:
            self.status = AgentStatus.FAILED
            return AgentResponse(
                agent_id=self.agent_id,
                output="",
                status=AgentStatus.FAILED,
                task_id=request.task_id,
                error=f"{type(exc).__name__}: {exc}",
            )

    async def reset(self) -> None:
        """Return a failed or completed agent to a ready state."""
        if self.status not in (
            AgentStatus.READY,
            AgentStatus.COMPLETED,
            AgentStatus.FAILED,
            AgentStatus.CANCELLED,
        ):
            raise AgentStateError(
                f"Cannot reset agent while status is {self.status.value}"
            )
        self.status = AgentStatus.READY

    @abstractmethod
    async def execute(
        self,
        request: AgentRequest,
        context: AgentContext,
    ) -> str:
        """Implement the agent's task-specific behavior."""


__all__ = ["BaseAgent"]
