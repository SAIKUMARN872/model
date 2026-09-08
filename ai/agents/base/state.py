"""
Base state management for ModelNow agents.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from threading import RLock
from typing import Any


class AgentStateError(RuntimeError):
    """Base exception for agent state errors."""


class InvalidStateTransitionError(
    AgentStateError
):
    """Raised for an invalid state transition."""


class AgentStatus(str, Enum):
    """
    Agent lifecycle states.
    """

    IDLE = "idle"

    RUNNING = "running"

    WAITING = "waiting"

    COMPLETED = "completed"

    FAILED = "failed"

    STOPPED = "stopped"


@dataclass
class BaseAgentState:
    """
    Mutable state of an agent.
    """

    status: AgentStatus = AgentStatus.IDLE

    iteration: int = 0

    tool_calls: int = 0

    input_tokens: int = 0

    output_tokens: int = 0

    last_input: str | None = None

    last_output: str | None = None

    last_error: str | None = None

    started_at: datetime | None = None

    completed_at: datetime | None = None

    data: dict[str, Any] = field(
        default_factory=dict
    )


class AgentStateManager:
    """
    Thread-safe manager for agent state.
    """

    def __init__(
        self,
        state: BaseAgentState | None = None,
    ) -> None:

        self._state = (
            state
            or BaseAgentState()
        )

        self._lock = RLock()

    @property
    def state(self) -> BaseAgentState:

        with self._lock:
            return self._state

    @property
    def status(self) -> AgentStatus:

        with self._lock:
            return self._state.status

    def start(
        self,
        user_input: str,
    ) -> BaseAgentState:

        with self._lock:

            if (
                self._state.status
                == AgentStatus.RUNNING
            ):
                raise InvalidStateTransitionError(
                    "Agent is already running"
                )

            self._state.status = (
                AgentStatus.RUNNING
            )

            self._state.iteration = 0
            self._state.tool_calls = 0

            self._state.last_input = (
                user_input
            )

            self._state.last_output = None
            self._state.last_error = None

            self._state.started_at = (
                datetime.now(timezone.utc)
            )

            self._state.completed_at = None

            return self._state

    def increment_iteration(
        self,
    ) -> int:

        with self._lock:

            self._state.iteration += 1

            return self._state.iteration

    def increment_tool_calls(
        self,
    ) -> int:

        with self._lock:

            self._state.tool_calls += 1

            return self._state.tool_calls

    def add_input_tokens(
        self,
        count: int,
    ) -> None:

        if count < 0:
            raise ValueError(
                "Token count cannot be negative"
            )

        with self._lock:
            self._state.input_tokens += count

    def add_output_tokens(
        self,
        count: int,
    ) -> None:

        if count < 0:
            raise ValueError(
                "Token count cannot be negative"
            )

        with self._lock:
            self._state.output_tokens += count

    def complete(
        self,
        output: str,
    ) -> BaseAgentState:

        with self._lock:

            self._state.status = (
                AgentStatus.COMPLETED
            )

            self._state.last_output = output

            self._state.completed_at = (
                datetime.now(timezone.utc)
            )

            return self._state

    def fail(
        self,
        error: str,
    ) -> BaseAgentState:

        with self._lock:

            self._state.status = (
                AgentStatus.FAILED
            )

            self._state.last_error = error

            self._state.completed_at = (
                datetime.now(timezone.utc)
            )

            return self._state

    def stop(self) -> BaseAgentState:

        with self._lock:

            self._state.status = (
                AgentStatus.STOPPED
            )

            self._state.completed_at = (
                datetime.now(timezone.utc)
            )

            return self._state

    def wait(self) -> BaseAgentState:

        with self._lock:

            if (
                self._state.status
                != AgentStatus.RUNNING
            ):
                raise InvalidStateTransitionError(
                    "Only a running agent can enter "
                    "waiting state"
                )

            self._state.status = (
                AgentStatus.WAITING
            )

            return self._state

    def resume(self) -> BaseAgentState:

        with self._lock:

            if (
                self._state.status
                != AgentStatus.WAITING
            ):
                raise InvalidStateTransitionError(
                    "Only a waiting agent can resume"
                )

            self._state.status = (
                AgentStatus.RUNNING
            )

            return self._state

    def set(
        self,
        key: str,
        value: Any,
    ) -> None:

        with self._lock:
            self._state.data[key] = value

    def get(
        self,
        key: str,
        default: Any = None,
    ) -> Any:

        with self._lock:
            return self._state.data.get(
                key,
                default,
            )

    def reset(self) -> None:

        with self._lock:
            self._state = BaseAgentState()

    def snapshot(self) -> dict[str, Any]:

        with self._lock:

            return {
                "status": self._state.status.value,
                "iteration": self._state.iteration,
                "tool_calls": self._state.tool_calls,
                "input_tokens": self._state.input_tokens,
                "output_tokens": self._state.output_tokens,
                "last_input": self._state.last_input,
                "last_output": self._state.last_output,
                "last_error": self._state.last_error,
                "started_at": (
                    self._state.started_at.isoformat()
                    if self._state.started_at
                    else None
                ),
                "completed_at": (
                    self._state.completed_at.isoformat()
                    if self._state.completed_at
                    else None
                ),
                "data": dict(
                    self._state.data
                ),
            }