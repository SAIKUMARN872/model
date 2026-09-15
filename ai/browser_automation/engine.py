"""
Central AI engine.

Coordinates sessions, providers, agents and tools.
"""

from __future__ import annotations

from typing import Any

from .exceptions import (
    ConfigurationError,
)
from .interfaces import (
    AIProvider,
    Agent,
    Tool,
)
from .models import (
    AIRequest,
    AIResponse,
)
from .session import (
    SessionManager,
)


class AIEngine:
    """
    Main orchestration engine for the AI platform.

    Responsibilities:

    - provider registration
    - agent registration
    - tool registration
    - session management
    - AI request execution
    """

    def __init__(
        self,
        provider: AIProvider | None = None,
    ) -> None:

        self.provider = provider

        self.sessions = (
            SessionManager()
        )

        self._agents: dict[
            str,
            Agent,
        ] = {}

        self._tools: dict[
            str,
            Tool,
        ] = {}

    def set_provider(
        self,
        provider: AIProvider,
    ) -> None:

        if provider is None:

            raise ConfigurationError(
                "AI provider cannot be None."
            )

        self.provider = provider

    def register_agent(
        self,
        name: str,
        agent: Agent,
    ) -> None:

        name = name.strip().lower()

        if not name:

            raise ValueError(
                "Agent name cannot be empty."
            )

        if agent is None:

            raise ValueError(
                "Agent cannot be None."
            )

        self._agents[name] = agent

    def register_tool(
        self,
        tool: Tool,
    ) -> None:

        if tool is None:

            raise ValueError(
                "Tool cannot be None."
            )

        name = tool.name.strip().lower()

        if not name:

            raise ValueError(
                "Tool name cannot be empty."
            )

        self._tools[name] = tool

    def get_agent(
        self,
        name: str,
    ) -> Agent:

        name = name.strip().lower()

        if name not in self._agents:

            raise KeyError(
                f"Agent '{name}' not found."
            )

        return self._agents[name]

    def get_tool(
        self,
        name: str,
    ) -> Tool:

        name = name.strip().lower()

        if name not in self._tools:

            raise KeyError(
                f"Tool '{name}' not found."
            )

        return self._tools[name]

    async def generate(
        self,
        request: AIRequest,
    ) -> AIResponse:

        if self.provider is None:

            raise ConfigurationError(
                "No AI provider configured."
            )

        content = await self.provider.generate(
            request.prompt,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            **request.metadata,
        )

        return AIResponse(
            content=content,
            model=request.model,
            metadata={
                "request_id": request.request_id
            },
        )

    async def run_agent(
        self,
        agent_name: str,
        input_data: Any,
        **kwargs: Any,
    ) -> Any:

        agent = self.get_agent(
            agent_name
        )

        return await agent.run(
            input_data,
            **kwargs,
        )

    async def execute_tool(
        self,
        tool_name: str,
        **arguments: Any,
    ) -> Any:

        tool = self.get_tool(
            tool_name
        )

        return await tool.execute(
            **arguments
        )

    def create_session(
        self,
        user_id: str | None = None,
        metadata: dict[str, Any] | None = None,
        auto_activate: bool = True,
    ):

        return self.sessions.create(
            user_id=user_id,
            metadata=metadata,
            auto_activate=auto_activate,
        )

    def health(
        self,
    ) -> dict[str, Any]:

        return {
            "status": "healthy",
            "provider": (
                self.provider is not None
            ),
            "agents": len(
                self._agents
            ),
            "tools": len(
                self._tools
            ),
            "sessions": self.sessions.count(),
        }