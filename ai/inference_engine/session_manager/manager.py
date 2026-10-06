from __future__ import annotations

from typing import Any

from .context import SessionContext
from .history import SessionHistory


class SessionManager:
    """Manage inference session context and conversation history."""

    def __init__(self) -> None:
        self._contexts: dict[str, SessionContext] = {}
        self._histories: dict[str, SessionHistory] = {}

    def create(
        self,
        session_id: str,
        *,
        model: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> SessionContext:
        session_id = session_id.strip()

        if not session_id:
            raise ValueError("session_id cannot be empty.")

        if session_id in self._contexts:
            raise ValueError(
                f"Session already exists: {session_id}"
            )

        context = SessionContext(
            session_id=session_id,
            model=model,
            metadata=dict(metadata or {}),
        )

        self._contexts[session_id] = context
        self._histories[session_id] = SessionHistory()

        return context

    def get_context(
        self,
        session_id: str,
    ) -> SessionContext:
        try:
            return self._contexts[session_id]
        except KeyError as exc:
            raise LookupError(
                f"Session not found: {session_id}"
            ) from exc

    def get_history(
        self,
        session_id: str,
    ) -> SessionHistory:
        try:
            return self._histories[session_id]
        except KeyError as exc:
            raise LookupError(
                f"Session not found: {session_id}"
            ) from exc

    def add_message(
        self,
        session_id: str,
        message: dict[str, Any],
    ) -> None:
        self.get_history(session_id).add_message(message)

    def add_messages(
        self,
        session_id: str,
        messages: list[dict[str, Any]],
    ) -> None:
        self.get_history(session_id).add_messages(messages)

    def update_context(
        self,
        session_id: str,
        *,
        model: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.get_context(session_id).update(
            model=model,
            metadata=metadata,
        )

    def delete(
        self,
        session_id: str,
    ) -> None:
        self._contexts.pop(session_id, None)
        self._histories.pop(session_id, None)

    def exists(
        self,
        session_id: str,
    ) -> bool:
        return session_id in self._contexts

    def clear(self) -> None:
        self._contexts.clear()
        self._histories.clear()


__all__ = ["SessionManager"]
