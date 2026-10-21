from __future__ import annotations

from threading import RLock

from ..constants import AgentStatus
from ..exceptions import AgentStateError


class AgentStateMachine:
    """Thread-safe state transitions for an agent lifecycle."""

    _ALLOWED_TRANSITIONS = {
        AgentStatus.CREATED: {AgentStatus.READY},
        AgentStatus.READY: {AgentStatus.RUNNING},
        AgentStatus.RUNNING: {
            AgentStatus.READY,
            AgentStatus.COMPLETED,
            AgentStatus.FAILED,
            AgentStatus.CANCELLED,
        },
        AgentStatus.COMPLETED: {AgentStatus.READY},
        AgentStatus.FAILED: {AgentStatus.READY},
        AgentStatus.CANCELLED: {AgentStatus.READY},
    }

    def __init__(self, initial_status: AgentStatus = AgentStatus.CREATED) -> None:
        if not isinstance(initial_status, AgentStatus):
            raise AgentStateError("initial_status must be an AgentStatus")

        self._status = initial_status
        self._lock = RLock()

    @property
    def status(self) -> AgentStatus:
        """Return the current lifecycle status."""
        with self._lock:
            return self._status

    def transition(self, target: AgentStatus) -> AgentStatus:
        """Validate and apply a lifecycle transition."""
        if not isinstance(target, AgentStatus):
            raise AgentStateError("target must be an AgentStatus")

        with self._lock:
            if target not in self._ALLOWED_TRANSITIONS[self._status]:
                raise AgentStateError(
                    f"Invalid agent state transition: "
                    f"{self._status.value} -> {target.value}"
                )

            self._status = target
            return self._status

    def reset(self) -> AgentStatus:
        """Reset a completed, failed, or cancelled agent to READY."""
        with self._lock:
            if self._status not in (
                AgentStatus.COMPLETED,
                AgentStatus.FAILED,
                AgentStatus.CANCELLED,
            ):
                raise AgentStateError(
                    f"Cannot reset agent while status is {self._status.value}"
                )

            self._status = AgentStatus.READY
            return self._status


__all__ = ["AgentStateMachine"]
