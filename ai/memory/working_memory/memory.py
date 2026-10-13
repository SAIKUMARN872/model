from __future__ import annotations

import threading
from datetime import timedelta
from typing import Any

from .context import WorkingMemoryContext
from .state import WorkingMemoryState
from .utils import json_safe_copy, utc_now, validate_identifier, validate_state


class WorkingMemoryError(Exception):
    """Base error for working-memory operations."""


class WorkingMemoryNotFoundError(WorkingMemoryError):
    pass


class WorkingMemoryConflictError(WorkingMemoryError):
    pass


class WorkingMemory:
    def __init__(
        self,
        *,
        max_entries: int = 10_000,
        default_ttl_seconds: int | None = 3600,
        max_ttl_seconds: int = 86_400,
    ) -> None:
        if isinstance(max_entries, bool) or not isinstance(max_entries, int) or max_entries < 1:
            raise ValueError("max_entries must be a positive integer")
        if default_ttl_seconds is not None and (
            isinstance(default_ttl_seconds, bool)
            or not isinstance(default_ttl_seconds, int)
            or default_ttl_seconds < 1
        ):
            raise ValueError("default_ttl_seconds must be a positive integer or None")
        if isinstance(max_ttl_seconds, bool) or not isinstance(max_ttl_seconds, int) or max_ttl_seconds < 1:
            raise ValueError("max_ttl_seconds must be a positive integer")
        if default_ttl_seconds is not None and default_ttl_seconds > max_ttl_seconds:
            raise ValueError("default TTL cannot exceed max TTL")

        self.max_entries = max_entries
        self.default_ttl_seconds = default_ttl_seconds
        self.max_ttl_seconds = max_ttl_seconds
        self._lock = threading.RLock()
        self._states: dict[tuple, WorkingMemoryState] = {}

    @staticmethod
    def _scope(context: WorkingMemoryContext) -> tuple:
        if not isinstance(context, WorkingMemoryContext):
            raise ValueError("context must be a WorkingMemoryContext")
        return context.scope_key

    def _expiry(self, ttl_seconds: int | None):
        if ttl_seconds is None:
            ttl_seconds = self.default_ttl_seconds
        if ttl_seconds is None:
            return None
        if isinstance(ttl_seconds, bool) or not isinstance(ttl_seconds, int):
            raise ValueError("ttl_seconds must be an integer or None")
        if ttl_seconds < 1 or ttl_seconds > self.max_ttl_seconds:
            raise ValueError(f"ttl_seconds must be between 1 and {self.max_ttl_seconds}")
        return utc_now() + timedelta(seconds=ttl_seconds)

    def _prune_expired(self) -> None:
        expired = [key for key, state in self._states.items() if state.is_expired]
        for key in expired:
            del self._states[key]

    def create(
        self,
        context: WorkingMemoryContext,
        initial_state: dict[str, Any] | None = None,
        *,
        ttl_seconds: int | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> WorkingMemoryState:
        scope = self._scope(context)
        data = validate_state(initial_state or {})
        expires_at = self._expiry(ttl_seconds)

        with self._lock:
            self._prune_expired()
            if scope in self._states:
                raise WorkingMemoryConflictError("Working memory already exists for this scope")
            if len(self._states) >= self.max_entries:
                raise WorkingMemoryConflictError("Working-memory capacity reached")
            now = utc_now()
            state = WorkingMemoryState(
                context=context,
                data=data,
                version=1,
                created_at=now,
                updated_at=now,
                expires_at=expires_at,
                metadata=json_safe_copy(metadata or {}, field_name="metadata"),
            )
            self._states[scope] = state
            return WorkingMemoryState.from_dict(state.to_dict())

    def get(self, context: WorkingMemoryContext) -> WorkingMemoryState:
        scope = self._scope(context)
        with self._lock:
            state = self._states.get(scope)
            if state is None:
                raise WorkingMemoryNotFoundError("Working memory not found")
            if state.is_expired:
                del self._states[scope]
                raise WorkingMemoryNotFoundError("Working memory not found")
            return WorkingMemoryState.from_dict(state.to_dict())

    def replace(
        self,
        context: WorkingMemoryContext,
        data: dict[str, Any],
        *,
        expected_version: int,
    ) -> WorkingMemoryState:
        return self._update(context, validate_state(data), expected_version, replace=True)

    def merge(
        self,
        context: WorkingMemoryContext,
        updates: dict[str, Any],
        *,
        expected_version: int,
    ) -> WorkingMemoryState:
        if not isinstance(updates, dict):
            raise ValueError("updates must be a dictionary")
        updates = json_safe_copy(updates, field_name="updates")
        return self._update(context, updates, expected_version, replace=False)

    def _update(
        self,
        context: WorkingMemoryContext,
        changes: dict[str, Any],
        expected_version: int,
        *,
        replace: bool,
    ) -> WorkingMemoryState:
        scope = self._scope(context)
        if isinstance(expected_version, bool) or not isinstance(expected_version, int) or expected_version < 1:
            raise ValueError("expected_version must be a positive integer")

        with self._lock:
            state = self._states.get(scope)
            if state is None or state.is_expired:
                self._states.pop(scope, None)
                raise WorkingMemoryNotFoundError("Working memory not found")
            if state.version != expected_version:
                raise WorkingMemoryConflictError(
                    f"Version conflict: expected {expected_version}, current {state.version}"
                )
            new_data = changes if replace else {**state.data, **changes}
            new_data = validate_state(new_data)
            updated = WorkingMemoryState(
                context=state.context,
                data=new_data,
                version=state.version + 1,
                created_at=state.created_at,
                updated_at=utc_now(),
                expires_at=state.expires_at,
                metadata=state.metadata,
            )
            self._states[scope] = updated
            return WorkingMemoryState.from_dict(updated.to_dict())

    def delete_key(
        self,
        context: WorkingMemoryContext,
        key: str,
        *,
        expected_version: int,
    ) -> WorkingMemoryState:
        key = validate_identifier(key, "key")
        state = self.get(context)
        if state.version != expected_version:
            raise WorkingMemoryConflictError(
                f"Version conflict: expected {expected_version}, current {state.version}"
            )
        new_data = dict(state.data)
        new_data.pop(key, None)
        return self.replace(context, new_data, expected_version=expected_version)

    def clear(
        self,
        context: WorkingMemoryContext,
        *,
        expected_version: int | None = None,
    ) -> bool:
        scope = self._scope(context)
        with self._lock:
            state = self._states.get(scope)
            if state is None or state.is_expired:
                self._states.pop(scope, None)
                return False
            if expected_version is not None and state.version != expected_version:
                raise WorkingMemoryConflictError(
                    f"Version conflict: expected {expected_version}, current {state.version}"
                )
            del self._states[scope]
            return True

    def count(self) -> int:
        with self._lock:
            self._prune_expired()
            return len(self._states)

    def clear_all(self) -> int:
        with self._lock:
            count = len(self._states)
            self._states.clear()
            return count
