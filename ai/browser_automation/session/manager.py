"""
Session manager.

Thread-safe in-memory session registry.
"""

from __future__ import annotations

from threading import RLock
from typing import Any

from .session import Session
from .state import SessionState


class SessionManager:
    """
    Creates, retrieves and manages AI sessions.
    """

    def __init__(
        self,
        max_sessions: int | None = None,
    ) -> None:

        if (
            max_sessions is not None
            and max_sessions <= 0
        ):

            raise ValueError(
                "max_sessions must be positive."
            )

        self.max_sessions = max_sessions

        self._sessions: dict[
            str,
            Session,
        ] = {}

        self._lock = RLock()

    def create(
        self,
        user_id: str | None = None,
        metadata: dict[str, Any] | None = None,
        auto_activate: bool = False,
    ) -> Session:

        with self._lock:

            if (
                self.max_sessions is not None
                and len(self._sessions)
                >= self.max_sessions
            ):

                raise RuntimeError(
                    "Maximum number of sessions reached."
                )

            session = Session(
                user_id=user_id,
                metadata=metadata or {},
            )

            self._sessions[
                session.session_id
            ] = session

            if auto_activate:

                session.activate()

            return session

    def get(
        self,
        session_id: str,
    ) -> Session | None:

        with self._lock:

            return self._sessions.get(
                session_id
            )

    def require(
        self,
        session_id: str,
    ) -> Session:

        session = self.get(
            session_id
        )

        if session is None:

            raise KeyError(
                f"Session '{session_id}' not found."
            )

        return session

    def activate(
        self,
        session_id: str,
    ) -> Session:

        session = self.require(
            session_id
        )

        with self._lock:

            session.activate()

            return session

    def pause(
        self,
        session_id: str,
    ) -> Session:

        session = self.require(
            session_id
        )

        with self._lock:

            session.pause()

            return session

    def complete(
        self,
        session_id: str,
        result: Any = None,
    ) -> Session:

        session = self.require(
            session_id
        )

        with self._lock:

            session.complete(
                result
            )

            return session

    def fail(
        self,
        session_id: str,
        error: str,
    ) -> Session:

        session = self.require(
            session_id
        )

        with self._lock:

            session.fail(
                error
            )

            return session

    def cancel(
        self,
        session_id: str,
        reason: str | None = None,
    ) -> Session:

        session = self.require(
            session_id
        )

        with self._lock:

            session.cancel(
                reason
            )

            return session

    def remove(
        self,
        session_id: str,
    ) -> Session | None:

        with self._lock:

            return self._sessions.pop(
                session_id,
                None,
            )

    def list(
        self,
        state: SessionState | None = None,
    ) -> list[Session]:

        with self._lock:

            sessions = list(
                self._sessions.values()
            )

            if state is not None:

                sessions = [
                    session
                    for session in sessions
                    if session.state == state
                ]

            return sessions

    def active_sessions(
        self,
    ) -> list[Session]:

        return self.list(
            SessionState.ACTIVE
        )

    def count(self) -> int:

        with self._lock:

            return len(
                self._sessions
            )

    def clear(
        self,
        include_active: bool = False,
    ) -> None:

        with self._lock:

            if include_active:

                self._sessions.clear()

                return

            removable = [
                session_id
                for (
                    session_id,
                    session,
                ) in self._sessions.items()
                if session.terminal
            ]

            for session_id in removable:

                self._sessions.pop(
                    session_id,
                    None,
                )