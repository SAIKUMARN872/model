"""
Base executable agent for ModelNow.

Specialized agents should inherit from BaseAgent and
implement the `execute` method.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable
from uuid import uuid4

from .context import BaseAgentContext
from .state import (
    AgentStateManager,
    AgentStatus,
    BaseAgentState,
)
from .utils import (
    execute,
    merge_metadata,
    normalize_input,
    normalize_output,
    safe_error,
    validate_agent_name,
    validate_max_iterations,
)


class BaseAgentError(Exception):
    """Base exception for all base-agent errors."""


class BaseAgentConfigurationError(
    BaseAgentError
):
    """Invalid base-agent configuration."""


class BaseAgentExecutionError(
    BaseAgentError
):
    """Base-agent execution failure."""


class AgentIterationLimitError(
    BaseAgentExecutionError
):
    """Agent exceeded its configured iteration limit."""


@dataclass
class BaseAgentConfig:
    """
    Configuration shared by agents.
    """

    name: str

    description: str = ""

    system_prompt: str = ""

    max_iterations: int = 10

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.name = validate_agent_name(
            self.name
        )

        self.max_iterations = (
            validate_max_iterations(
                self.max_iterations
            )
        )


@dataclass(frozen=True)
class BaseAgentResult:
    """
    Standard result returned by a base agent.
    """

    run_id: str

    agent_id: str

    agent_name: str

    success: bool

    output: str

    error: str | None = None

    iterations: int = 0

    tool_calls: int = 0

    started_at: datetime | None = None

    completed_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "run_id": self.run_id,
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "success": self.success,
            "output": self.output,
            "error": self.error,
            "iterations": self.iterations,
            "tool_calls": self.tool_calls,
            "started_at": (
                self.started_at.isoformat()
                if self.started_at
                else None
            ),
            "completed_at": (
                self.completed_at.isoformat()
            ),
            "metadata": dict(
                self.metadata
            ),
        }


class BaseAgent(ABC):
    """
    Abstract base class for all ModelNow agents.

    Subclasses implement:

        execute(context, state)

    Example:

        class MyAgent(BaseAgent):

            async def execute(
                self,
                context,
                state,
            ):
                return "Hello"
    """

    def __init__(
        self,
        config: BaseAgentConfig,
        agent_id: str | None = None,
        tools: dict[
            str,
            Callable[..., Any],
        ] | None = None,
    ) -> None:

        if not isinstance(
            config,
            BaseAgentConfig,
        ):
            raise BaseAgentConfigurationError(
                "config must be BaseAgentConfig"
            )

        self.config = config

        self.agent_id = (
            agent_id
            or str(uuid4())
        )

        self.state_manager = (
            AgentStateManager()
        )

        self._tools: dict[
            str,
            Callable[..., Any],
        ] = dict(tools or {})

        self._history: list[
            BaseAgentResult
        ] = []

    @property
    def name(self) -> str:

        return self.config.name

    @property
    def state(self) -> BaseAgentState:

        return self.state_manager.state

    @property
    def status(self) -> AgentStatus:

        return self.state_manager.status

    @property
    def tool_names(self) -> list[str]:

        return sorted(
            self._tools.keys()
        )

    def register_tool(
        self,
        name: str,
        tool: Callable[..., Any],
    ) -> None:

        if not name:
            raise ValueError(
                "Tool name cannot be empty"
            )

        if not callable(tool):
            raise TypeError(
                "Tool must be callable"
            )

        self._tools[name] = tool

    def unregister_tool(
        self,
        name: str,
    ) -> bool:

        if name not in self._tools:
            return False

        del self._tools[name]

        return True

    def create_context(
        self,
        user_input: str,
        session_id: str | None = None,
        user_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> BaseAgentContext:

        normalized_input = normalize_input(
            user_input
        )

        context = BaseAgentContext(
            user_input=normalized_input,
            session_id=session_id,
            user_id=user_id,
            metadata=merge_metadata(
                self.config.metadata,
                metadata,
            ),
        )

        for name, tool in self._tools.items():

            context.register_tool(
                name,
                tool,
            )

        context.set(
            "agent_id",
            self.agent_id,
        )

        context.set(
            "agent_name",
            self.name,
        )

        if self.config.system_prompt:

            context.set(
                "system_prompt",
                self.config.system_prompt,
            )

        return context

    def run(
        self,
        user_input: str,
        session_id: str | None = None,
        user_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> BaseAgentResult:
        """
        Execute the agent synchronously.
        """

        context = self.create_context(
            user_input=user_input,
            session_id=session_id,
            user_id=user_id,
            metadata=metadata,
        )

        from .utils import run_sync

        return run_sync(
            self.arun_context(context)
        )

    async def arun(
        self,
        user_input: str,
        session_id: str | None = None,
        user_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> BaseAgentResult:
        """
        Execute the agent asynchronously.
        """

        context = self.create_context(
            user_input=user_input,
            session_id=session_id,
            user_id=user_id,
            metadata=metadata,
        )

        return await self.arun_context(
            context
        )

    async def arun_context(
        self,
        context: BaseAgentContext,
    ) -> BaseAgentResult:
        """
        Execute the agent using an existing context.
        """

        if not isinstance(
            context,
            BaseAgentContext,
        ):
            raise TypeError(
                "context must be BaseAgentContext"
            )

        run_id = str(uuid4())

        self.state_manager.start(
            context.user_input
        )

        context.add_message(
            "user",
            context.user_input,
        )

        started_at = (
            self.state.started_at
        )

        try:

            iteration = (
                self.state_manager
                .increment_iteration()
            )

            if (
                iteration
                > self.config.max_iterations
            ):
                raise AgentIterationLimitError(
                    "Maximum agent iterations exceeded"
                )

            result = await execute(
                self.execute,
                context,
                self.state,
            )

            output = normalize_output(
                result
            )

            self.state_manager.complete(
                output
            )

            context.add_message(
                "assistant",
                output,
            )

            agent_result = BaseAgentResult(
                run_id=run_id,
                agent_id=self.agent_id,
                agent_name=self.name,
                success=True,
                output=output,
                iterations=(
                    self.state.iteration
                ),
                tool_calls=(
                    self.state.tool_calls
                ),
                started_at=started_at,
                metadata=merge_metadata(
                    self.config.metadata,
                    context.metadata,
                    {
                        "session_id": (
                            context.session_id
                        ),
                        "user_id": (
                            context.user_id
                        ),
                    },
                ),
            )

            self._history.append(
                agent_result
            )

            return agent_result

        except Exception as exc:

            error = safe_error(exc)

            self.state_manager.fail(
                error
            )

            agent_result = BaseAgentResult(
                run_id=run_id,
                agent_id=self.agent_id,
                agent_name=self.name,
                success=False,
                output="",
                error=error,
                iterations=(
                    self.state.iteration
                ),
                tool_calls=(
                    self.state.tool_calls
                ),
                started_at=started_at,
                metadata=merge_metadata(
                    self.config.metadata,
                    context.metadata,
                ),
            )

            self._history.append(
                agent_result
            )

            return agent_result

    @abstractmethod
    async def execute(
        self,
        context: BaseAgentContext,
        state: BaseAgentState,
    ) -> Any:
        """
        Execute the actual agent logic.

        Subclasses MUST implement this method.
        """

        raise NotImplementedError

    def call_tool(
        self,
        context: BaseAgentContext,
        name: str,
        *args: Any,
        **kwargs: Any,
    ) -> Any:
        """
        Execute a synchronous tool.
        """

        self.state_manager.increment_tool_calls()

        return context.call_tool(
            name,
            *args,
            **kwargs,
        )

    async def acall_tool(
        self,
        context: BaseAgentContext,
        name: str,
        *args: Any,
        **kwargs: Any,
    ) -> Any:
        """
        Execute either a synchronous or asynchronous tool.
        """

        self.state_manager.increment_tool_calls()

        tool = context.get_tool(
            name
        )

        return await execute(
            tool,
            *args,
            **kwargs,
        )

    def set_state(
        self,
        key: str,
        value: Any,
    ) -> None:

        self.state_manager.set(
            key,
            value,
        )

    def get_state(
        self,
        key: str,
        default: Any = None,
    ) -> Any:

        return self.state_manager.get(
            key,
            default,
        )

    def stop(self) -> None:

        self.state_manager.stop()

    def reset(self) -> None:

        self.state_manager.reset()

    def history(
        self,
    ) -> list[BaseAgentResult]:

        return list(
            self._history
        )

    def last_result(
        self,
    ) -> BaseAgentResult | None:

        if not self._history:
            return None

        return self._history[-1]

    def clear_history(self) -> None:

        self._history.clear()

    def describe(self) -> dict[str, Any]:

        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "description": (
                self.config.description
            ),
            "status": self.status.value,
            "max_iterations": (
                self.config.max_iterations
            ),
            "tools": self.tool_names,
            "metadata": dict(
                self.config.metadata
            ),
        }c