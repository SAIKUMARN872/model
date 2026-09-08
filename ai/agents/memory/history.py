"""
Conversation and memory history management.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import RLock
from typing import Any
from uuid import uuid4


class HistoryError(Exception):
    """Base history exception."""


@dataclass
class HistoryEntry:
    """
    Represents one historical interaction.
    """

    role: str
    content: str

    entry_id: str = field(
        default_factory=lambda: str(uuid4())
    )

    user_id: str | None = None
    session_id: str | None = None
    conversation_id: str | None = None

    timestamp: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.role:
            raise ValueError(
                "role cannot be empty"
            )

        if not isinstance(
            self.content,
            str,
        ):
            raise TypeError(
                "content must be a string"
            )

    def to_dict(self) -> dict[str, Any]:

        return {
            "entry_id": self.entry_id,
            "role": self.role,
            "content": self.content,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "conversation_id": self.conversation_id,
            "timestamp": self.timestamp.isoformat(),
            "metadata": dict(self.metadata),
        }


class HistoryStore:
    """
    Thread-safe in-memory history store.

    This is intentionally storage-agnostic so a database,
    Redis, or vector store can be connected later.
    """

    def __init__(self) -> None:

        self._entries: dict[
            str,
            HistoryEntry,
        ] = {}

        self._lock = RLock()

    def add(
        self,
        role: str,
        content: str,
        user_id: str | None = None,
        session_id: str | None = None,
        conversation_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> HistoryEntry:

        entry = HistoryEntry(
            role=role,
            content=content,
            user_id=user_id,
            session_id=session_id,
            conversation_id=conversation_id,
            metadata=metadata or {},
        )

        with self._lock:

            self._entries[
                entry.entry_id
            ] = entry

        return entry

    def get(
        self,
        entry_id: str,
    ) -> HistoryEntry | None:

        with self._lock:

            return self._entries.get(
                entry_id
            )

    def delete(
        self,
        entry_id: str,
    ) -> bool:

        with self._lock:

            if entry_id not in self._entries:
                return False

            del self._entries[
                entry_id
            ]

            return True

    def get_session(
        self,
        session_id: str,
        limit: int | None = None,
    ) -> list[HistoryEntry]:

        with self._lock:

            entries = [
                entry
                for entry in self._entries.values()
                if entry.session_id == session_id
            ]

        entries.sort(
            key=lambda item: item.timestamp
        )

        if limit is not None:

            if limit <= 0:
                return []

            entries = entries[-limit:]

        return entries

    def get_conversation(
        self,
        conversation_id: str,
        limit: int | None = None,
    ) -> list[HistoryEntry]:

        with self._lock:

            entries = [
                entry
                for entry in self._entries.values()
                if (
                    entry.conversation_id
                    == conversation_id
                )
            ]

        entries.sort(
            key=lambda item: item.timestamp
        )

        if limit is not None:

            if limit <= 0:
                return []

            entries = entries[-limit:]

        return entries

    def get_user_history(
        self,
        user_id: str,
        limit: int | None = None,
    ) -> list[HistoryEntry]:

        with self._lock:

            entries = [
                entry
                for entry in self._entries.values()
                if entry.user_id == user_id
            ]

        entries.sort(
            key=lambda item: item.timestamp
        )

        if limit is not None:

            if limit <= 0:
                return []

            entries = entries[-limit:]

        return entries

    def search(
        self,
        query: str,
        user_id: str | None = None,
        limit: int = 20,
    ) -> list[HistoryEntry]:

        if not query.strip():
            return []

        query_lower = query.lower()

        with self._lock:

            entries = list(
                self._entries.values()
            )

        matches = []

        for entry in entries:

            if (
                user_id is not None
                and entry.user_id != user_id
            ):
                continue

            if query_lower in (
                entry.content.lower()
            ):

                matches.append(entry)

        matches.sort(
            key=lambda item: item.timestamp,
            reverse=True,
        )

        return matches[:limit]

    def count(
        self,
        user_id: str | None = None,
    ) -> int:

        with self._lock:

            if user_id is None:
                return len(self._entries)

            return sum(
                entry.user_id == user_id
                for entry in self._entries.values()
            )

    def clear(
        self,
        user_id: str | None = None,
    ) -> None:

        with self._lock:

            if user_id is None:

                self._entries.clear()

                return

            entry_ids = [
                entry_id
                for entry_id, entry
                in self._entries.items()
                if entry.user_id == user_id
            ]

            for entry_id in entry_ids:

                del self._entries[
                    entry_id
                ]