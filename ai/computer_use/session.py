from __future__ import annotations

from threading import RLock
from typing import Iterable

from .constants import ComputerUseStatus
from .exceptions import ComputerUseError
from .models import ComputerAction, ComputerSession, ComputerState, utc_now
from .state import ComputerStateManager
from .utils import generate_id


_TERMINAL_STATUSES = {
    ComputerUseStatus.COMPLETED,
    ComputerUseStatus.FAILED,
    ComputerUseStatus.CANCELLED,
}


class ComputerSessionManager:
    """Thread-safe in-memory Computer Use session lifecycle manager."""

    def __init__(self, state_manager: ComputerStateManager | None = None) -> None:
        self.state_manager = state_manager or ComputerStateManager()
        self._lock = RLock()
        self._sessions: dict[str, ComputerSession] = {}

    def create_session(
        self,
        session_id: str | None = None,
        metadata: dict | None = None,
    ) -> ComputerSession:
        identifier = session_id or generate_id("session")
        with self._lock:
            if identifier in self._sessions:
                raise ComputerUseError("A session with this ID already exists.")
            session = ComputerSession(
                session_id=identifier,
                state=self.state_manager.get_state(),
                metadata=dict(metadata or {}),
            )
            self._sessions[identifier] = session
            return self._copy(session)

    def get_session(self, session_id: str) -> ComputerSession:
        with self._lock:
            session = self._sessions.get(session_id)
            if session is None:
                raise ComputerUseError("Computer Use session was not found.")
            return self._copy(session)

    def list_sessions(self) -> list[ComputerSession]:
        with self._lock:
            return [self._copy(session) for session in self._sessions.values()]

    def start_session(self, session_id: str) -> ComputerSession:
        with self._lock:
            session = self._require(session_id)
            if session.status != ComputerUseStatus.IDLE:
                raise ComputerUseError("Only idle sessions can be started.")
            session.status = ComputerUseStatus.RUNNING
            session.started_at = utc_now()
            session.state.status = ComputerUseStatus.RUNNING
            return self._copy(session)

    def add_action(
        self, session_id: str, action: ComputerAction
    ) -> ComputerSession:
        if not isinstance(action, ComputerAction):
            raise TypeError("action must be a ComputerAction instance.")
        with self._lock:
            session = self._require(session_id)
            if session.status in _TERMINAL_STATUSES:
                raise ComputerUseError("Cannot add actions to a finished session.")
            if any(item.action_id == action.action_id for item in session.actions):
                raise ComputerUseError("Action ID already exists in this session.")
            session.actions.append(action)
            return self._copy(session)

    def replace_action(
        self, session_id: str, action: ComputerAction
    ) -> ComputerSession:
        """Replace an existing action record without changing its history position."""
        if not isinstance(action, ComputerAction):
            raise TypeError("action must be a ComputerAction instance.")
        with self._lock:
            session = self._require(session_id)
            if session.status in _TERMINAL_STATUSES:
                raise ComputerUseError("Cannot modify actions in a finished session.")
            for index, existing in enumerate(session.actions):
                if existing.action_id == action.action_id:
                    session.actions[index] = action
                    return self._copy(session)
            raise ComputerUseError("Action ID does not exist in this session.")
    def update_status(
        self, session_id: str, status: ComputerUseStatus
    ) -> ComputerSession:
        if not isinstance(status, ComputerUseStatus):
            raise TypeError("status must be a ComputerUseStatus value.")
        with self._lock:
            session = self._require(session_id)
            if session.status in _TERMINAL_STATUSES:
                raise ComputerUseError("A finished session cannot change status.")
            session.status = status
            session.state.status = status
            if status in _TERMINAL_STATUSES:
                session.ended_at = utc_now()
            return self._copy(session)

    def update_state(
        self, session_id: str, state: ComputerState
    ) -> ComputerSession:
        if not isinstance(state, ComputerState):
            raise TypeError("state must be a ComputerState instance.")
        with self._lock:
            session = self._require(session_id)
            if session.status in _TERMINAL_STATUSES:
                raise ComputerUseError("Cannot update a finished session.")
            session.state = state
            return self._copy(session)

    def cancel_session(self, session_id: str) -> ComputerSession:
        with self._lock:
            session = self._require(session_id)
            if session.status in _TERMINAL_STATUSES:
                raise ComputerUseError("Session is already finished.")
            session.status = ComputerUseStatus.CANCELLED
            session.state.status = ComputerUseStatus.CANCELLED
            session.ended_at = utc_now()
            return self._copy(session)

    def complete_session(self, session_id: str) -> ComputerSession:
        return self.update_status(session_id, ComputerUseStatus.COMPLETED)

    def fail_session(self, session_id: str) -> ComputerSession:
        return self.update_status(session_id, ComputerUseStatus.FAILED)

    def remove_session(self, session_id: str) -> ComputerSession:
        with self._lock:
            session = self._sessions.pop(session_id, None)
            if session is None:
                raise ComputerUseError("Computer Use session was not found.")
            return self._copy(session)

    def _require(self, session_id: str) -> ComputerSession:
        session = self._sessions.get(session_id)
        if session is None:
            raise ComputerUseError("Computer Use session was not found.")
        return session

    @staticmethod
    def _copy(session: ComputerSession) -> ComputerSession:
        from copy import deepcopy
        return deepcopy(session)


SessionManager = ComputerSessionManager

