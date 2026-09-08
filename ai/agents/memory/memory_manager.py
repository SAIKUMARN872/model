"""
Main memory manager for ModelNow.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import RLock
from typing import Any
from uuid import uuid4

from .context import MemoryContext
from .history import (
    HistoryEntry,
    HistoryStore,
)
from .utils import (
    normalize_text,
    rank_memories,
    sanitize_metadata,
)


class MemoryError(Exception):
    """Base memory exception."""


class MemoryNotFoundError(
    MemoryError
):
    """Raised when a memory cannot be found."""


@dataclass
class MemoryRecord:
    """
    Represents a stored memory.
    """

    content: str

    memory_id: str = field(
        default_factory=lambda: str(uuid4())
    )

    user_id: str | None = None
    session_id: str | None = None

    memory_type: str = "general"

    importance: float = 1.0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    updated_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    def __post_init__(self) -> None:

        self.content = normalize_text(
            self.content
        )

        if not self.content:
            raise ValueError(
                "Memory content cannot be empty"
            )

        if not (
            0.0
            <= self.importance
            <= 1.0
        ):
            raise ValueError(
                "importance must be between 0 and 1"
            )

        self.metadata = sanitize_metadata(
            self.metadata
        )

    def update(
        self,
        content: str | None = None,
        importance: float | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:

        if content is not None:

            content = normalize_text(
                content
            )

            if not content:
                raise ValueError(
                    "Memory content cannot be empty"
                )

            self.content = content

        if importance is not None:

            if not (
                0.0
                <= importance
                <= 1.0
            ):
                raise ValueError(
                    "importance must be between 0 and 1"
                )

            self.importance = importance

        if metadata is not None:

            self.metadata.update(
                sanitize_metadata(
                    metadata
                )
            )

        self.updated_at = (
            datetime.now(timezone.utc)
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "memory_id": self.memory_id,
            "content": self.content,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "memory_type": self.memory_type,
            "importance": self.importance,
            "metadata": dict(self.metadata),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


@dataclass
class MemorySearchResult:
    """Search result for a memory."""

    memory: MemoryRecord

    score: float

    def to_dict(self) -> dict[str, Any]:

        result = self.memory.to_dict()

        result["score"] = self.score

        return result


class MemoryManager:
    """
    Central memory manager.

    Provides:

        - memory creation
        - memory retrieval
        - memory updates
        - memory deletion
        - memory search
        - conversation history
        - context construction
    """

    def __init__(
        self,
        history_store: HistoryStore | None = None,
    ) -> None:

        self.history = (
            history_store
            or HistoryStore()
        )

        self._memories: dict[
            str,
            MemoryRecord,
        ] = {}

        self._lock = RLock()

    # --------------------------------------------------
    # Memory CRUD
    # --------------------------------------------------

    def add_memory(
        self,
        content: str,
        user_id: str | None = None,
        session_id: str | None = None,
        memory_type: str = "general",
        importance: float = 1.0,
        metadata: dict[str, Any] | None = None,
    ) -> MemoryRecord:

        memory = MemoryRecord(
            content=content,
            user_id=user_id,
            session_id=session_id,
            memory_type=memory_type,
            importance=importance,
            metadata=metadata or {},
        )

        with self._lock:

            self._memories[
                memory.memory_id
            ] = memory

        return memory

    def get_memory(
        self,
        memory_id: str,
    ) -> MemoryRecord | None:

        with self._lock:

            return self._memories.get(
                memory_id
            )

    def require_memory(
        self,
        memory_id: str,
    ) -> MemoryRecord:

        memory = self.get_memory(
            memory_id
        )

        if memory is None:

            raise MemoryNotFoundError(
                f"Memory not found: {memory_id}"
            )

        return memory

    def update_memory(
        self,
        memory_id: str,
        content: str | None = None,
        importance: float | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> MemoryRecord:

        memory = self.require_memory(
            memory_id
        )

        with self._lock:

            memory.update(
                content=content,
                importance=importance,
                metadata=metadata,
            )

        return memory

    def delete_memory(
        self,
        memory_id: str,
    ) -> bool:

        with self._lock:

            if memory_id not in self._memories:
                return False

            del self._memories[
                memory_id
            ]

            return True

    def clear_user_memories(
        self,
        user_id: str,
    ) -> int:

        with self._lock:

            ids = [
                memory_id
                for memory_id, memory
                in self._memories.items()
                if memory.user_id == user_id
            ]

            for memory_id in ids:

                del self._memories[
                    memory_id
                ]

            return len(ids)

    # --------------------------------------------------
    # Search
    # --------------------------------------------------

    def search(
        self,
        query: str,
        user_id: str | None = None,
        session_id: str | None = None,
        memory_type: str | None = None,
        limit: int = 10,
    ) -> list[MemorySearchResult]:

        query = normalize_text(
            query
        )

        if not query:
            return []

        if limit <= 0:
            return []

        with self._lock:

            memories = list(
                self._memories.values()
            )

        filtered = []

        for memory in memories:

            if (
                user_id is not None
                and memory.user_id != user_id
            ):
                continue

            if (
                session_id is not None
                and memory.session_id != session_id
            ):
                continue

            if (
                memory_type is not None
                and memory.memory_type
                != memory_type
            ):
                continue

            filtered.append(
                memory.to_dict()
            )

        ranked = rank_memories(
            filtered,
            query,
        )

        results = []

        for item in ranked[:limit]:

            memory = self.get_memory(
                item["memory_id"]
            )

            if memory is not None:

                results.append(
                    MemorySearchResult(
                        memory=memory,
                        score=float(
                            item.get(
                                "score",
                                0.0,
                            )
                        ),
                    )
                )

        return results

    # --------------------------------------------------
    # History
    # --------------------------------------------------

    def add_history(
        self,
        role: str,
        content: str,
        user_id: str | None = None,
        session_id: str | None = None,
        conversation_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> HistoryEntry:

        return self.history.add(
            role=role,
            content=content,
            user_id=user_id,
            session_id=session_id,
            conversation_id=conversation_id,
            metadata=metadata,
        )

    def get_history(
        self,
        session_id: str | None = None,
        conversation_id: str | None = None,
        user_id: str | None = None,
        limit: int = 20,
    ) -> list[HistoryEntry]:

        if conversation_id:

            return self.history.get_conversation(
                conversation_id,
                limit=limit,
            )

        if session_id:

            return self.history.get_session(
                session_id,
                limit=limit,
            )

        if user_id:

            return self.history.get_user_history(
                user_id,
                limit=limit,
            )

        return []

    # --------------------------------------------------
    # Context
    # --------------------------------------------------

    def build_context(
        self,
        current_input: str,
        user_id: str | None = None,
        session_id: str | None = None,
        conversation_id: str | None = None,
        memory_query: str | None = None,
        memory_limit: int = 5,
        history_limit: int = 20,
        metadata: dict[str, Any] | None = None,
    ) -> MemoryContext:

        context = MemoryContext(
            user_id=user_id,
            session_id=session_id,
            conversation_id=conversation_id,
            current_input=current_input,
            metadata=metadata or {},
        )

        query = (
            memory_query
            or current_input
        )

        if query:

            memories = self.search(
                query=query,
                user_id=user_id,
                session_id=session_id,
                limit=memory_limit,
            )

            for result in memories:

                context.add_memory(
                    result.to_dict()
                )

        history = self.get_history(
            session_id=session_id,
            conversation_id=conversation_id,
            user_id=user_id,
            limit=history_limit,
        )

        for entry in history:

            context.add_history(
                entry.to_dict()
            )

        return context

    # --------------------------------------------------
    # Statistics
    # --------------------------------------------------

    def memory_count(
        self,
        user_id: str | None = None,
    ) -> int:

        with self._lock:

            if user_id is None:
                return len(
                    self._memories
                )

            return sum(
                memory.user_id == user_id
                for memory
                in self._memories.values()
            )

    def all_memories(
        self,
        user_id: str | None = None,
    ) -> list[MemoryRecord]:

        with self._lock:

            memories = list(
                self._memories.values()
            )

        if user_id is not None:

            memories = [
                memory
                for memory in memories
                if memory.user_id == user_id
            ]

        memories.sort(
            key=lambda item: item.updated_at,
            reverse=True,
        )

        return memories

    def clear(self) -> None:

        with self._lock:

            self._memories.clear()

        self.history.clear()