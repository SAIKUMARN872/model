from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Protocol, runtime_checkable

from .models import AgentContext, AgentRequest, AgentResponse


@runtime_checkable
class AgentProtocol(Protocol):
    """Structural contract for an executable ModelNow agent."""

    agent_id: str
    name: str

    async def initialize(self) -> None:
        """Prepare the agent for execution."""

    async def run(self, request: AgentRequest) -> AgentResponse:
        """Execute a validated request."""


@runtime_checkable
class AgentExecutorProtocol(Protocol):
    """Contract for a component that executes agent requests."""

    async def execute(
        self,
        agent: AgentProtocol,
        request: AgentRequest,
    ) -> AgentResponse:
        """Execute a request through the supplied agent."""


AgentCallable = Callable[
    [AgentRequest, AgentContext],
    Awaitable[str],
]


__all__ = [
    "AgentProtocol",
    "AgentExecutorProtocol",
    "AgentCallable",
]
