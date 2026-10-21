from copy import deepcopy
from datetime import timedelta
from threading import RLock
from typing import Any
from uuid import uuid4

from .session import ManagedSession
from .state import ALLOWED_TRANSITIONS, SessionState
from .utils import utc_now, validate_identifier, validate_ttl


class SessionNotFoundError(KeyError):
    """The requested session does not exist."""


class SessionOwnershipError(PermissionError):
    """The caller does not own the requested session."""


class InvalidSessionTransitionError(ValueError):
    """A session state transition is not allowed."""


class SessionManager:
    """Thread-safe in-memory session metadata and lifecycle manager."""

    def __init__(self, default_ttl_seconds: float = 1800):
        self.default_ttl_seconds = validate_ttl(default_ttl_seconds)
        self._sessions: dict[str, ManagedSession] = {}
        self._lock = RLock()

    def create_session(
        self,
        user_id: str,
        task_id: str,
        ttl_seconds: float | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ManagedSession:
        user_id = validate_identifier(user_id, "user_id")
        task_id = validate_identifier(task_id, "task_id")
        ttl = validate_ttl(
            self.default_ttl_seconds if ttl_seconds is None else ttl_seconds
        )

        if metadata is not None and not isinstance(metadata, dict):
            raise ValueError("Session metadata must be a dictionary.")

        safe_metadata = deepcopy(metadata) if metadata is not None else {}
        now = utc_now()
        session = ManagedSession(
            session_id=str(uuid4()),
            user_id=user_id,
            task_id=task_id,
            state=SessionState.CREATED,
            created_at=now,
            updated_at=now,
            expires_at=now + timedelta(seconds=ttl),
            metadata=safe_metadata,
        )

        with self._lock:
            self._sessions[session.session_id] = session
            return session.snapshot()

    def _get_owned(
        self,
        session_id: str,
        user_id: str,
        task_id: str | None = None,
    ) -> ManagedSession:
        session_id = validate_identifier(session_id, "session_id")
        user_id = validate_identifier(user_id, "user_id")
        if task_id is not None:
            task_id = validate_identifier(task_id, "task_id")

        session = self._sessions.get(session_id)
        if session is None:
            raise SessionNotFoundError("Session not found.")

        if session.user_id != user_id or (
            task_id is not None and session.task_id != task_id
        ):
            raise SessionOwnershipError("Session ownership validation failed.")

        return session

    def _expire_if_needed(self, session: ManagedSession) -> None:
        now = utc_now()
        if (
            session.state not in (SessionState.CLOSED, SessionState.EXPIRED)
            and now >= session.expires_at
        ):
            session.state = SessionState.EXPIRED
            session.updated_at = now
            session.version += 1

    def get_session(
        self,
        session_id: str,
        user_id: str,
        task_id: str | None = None,
    ) -> ManagedSession:
        with self._lock:
            session = self._get_owned(session_id, user_id, task_id)
            self._expire_if_needed(session)
            return session.snapshot()

    def transition(
        self,
        session_id: str,
        user_id: str,
        new_state: SessionState | str,
        task_id: str | None = None,
    ) -> ManagedSession:
        try:
            target = (
                new_state
                if isinstance(new_state, SessionState)
                else SessionState(new_state)
            )
        except (ValueError, TypeError) as exc:
            raise InvalidSessionTransitionError(
                f"Unknown session state: {new_state!r}"
            ) from exc

        with self._lock:
            session = self._get_owned(session_id, user_id, task_id)
            self._expire_if_needed(session)

            if target == session.state:
                return session.snapshot()

            allowed = ALLOWED_TRANSITIONS[session.state]
            if target not in allowed:
                raise InvalidSessionTransitionError(
                    f"Cannot transition session from "
                    f"{session.state.value!r} to {target.value!r}."
                )

            session.state = target
            session.updated_at = utc_now()
            session.version += 1
            return session.snapshot()

    def close_session(
        self,
        session_id: str,
        user_id: str,
        task_id: str | None = None,
    ) -> ManagedSession:
        return self.transition(
            session_id, user_id, SessionState.CLOSED, task_id
        )

    def expire_sessions(self) -> int:
        """Mark all overdue, non-terminal sessions as expired."""
        expired = 0
        with self._lock:
            for session in self._sessions.values():
                before = session.state
                self._expire_if_needed(session)
                if before != session.state and session.state == SessionState.EXPIRED:
                    expired += 1
        return expired

    def cleanup(self) -> int:
        """Remove closed and expired records; does not close browser processes."""
        with self._lock:
            for session in self._sessions.values():
                self._expire_if_needed(session)

            removable = [
                session_id
                for session_id, session in self._sessions.items()
                if session.state in (SessionState.CLOSED, SessionState.EXPIRED)
            ]
            for session_id in removable:
                del self._sessions[session_id]
            return len(removable)

    def list_sessions(self, user_id: str) -> list[ManagedSession]:
        """List only sessions owned by the requested user."""
        user_id = validate_identifier(user_id, "user_id")
        with self._lock:
            results = []
            for session in self._sessions.values():
                self._expire_if_needed(session)
                if session.user_id == user_id:
                    results.append(session.snapshot())
            return results

    def update_metadata(
        self,
        session_id: str,
        user_id: str,
        metadata_updates: dict[str, Any],
        task_id: str | None = None,
    ) -> ManagedSession:
        if not isinstance(metadata_updates, dict):
            raise ValueError("Metadata updates must be a dictionary.")

        updates = deepcopy(metadata_updates)
        with self._lock:
            session = self._get_owned(session_id, user_id, task_id)
            self._expire_if_needed(session)

            if session.state in (SessionState.CLOSED, SessionState.EXPIRED):
                raise InvalidSessionTransitionError(
                    "Cannot update metadata on a closed or expired session."
                )

            session.metadata.update(updates)
            session.updated_at = utc_now()
            session.version += 1
            return session.snapshot()
