from __future__ import annotations

import threading
from datetime import datetime, timedelta
from typing import Any, Mapping

from .context import SessionContext
from .session import SessionRecord, SessionStatus
from .utils import (
    normalize_timestamp,
    new_session_id,
    validate_context_item,
    validate_identifier,
    validate_metadata,
    validate_positive_integer,
    validate_session_name,
)


class SessionNotFoundError(LookupError):
    pass


class SessionConflictError(RuntimeError):
    pass


class SessionManager:
    def __init__(
        self,
        *,
        default_ttl_seconds: int | None = 3600,
        max_sessions_per_user: int = 100,
    ) -> None:
        if default_ttl_seconds is not None:
            validate_positive_integer(default_ttl_seconds, "default_ttl_seconds")
        validate_positive_integer(max_sessions_per_user, "max_sessions_per_user")

        self._default_ttl_seconds = default_ttl_seconds
        self._max_sessions_per_user = max_sessions_per_user
        self._records: dict[tuple[str, str, str], SessionRecord] = {}
        self._lock = threading.RLock()

    @staticmethod
    def _key(tenant_id: str, user_id: str, session_id: str) -> tuple[str, str, str]:
        return (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
            validate_identifier(session_id, "session_id"),
        )

    def _get_locked(
        self, tenant_id: str, user_id: str, session_id: str
    ) -> SessionRecord:
        key = self._key(tenant_id, user_id, session_id)
        record = self._records.get(key)
        if record is None:
            raise SessionNotFoundError("session not found in the requested scope")

        if record.status == SessionStatus.ACTIVE and record.is_expired():
            record = SessionRecord(
                **{
                    **record.__dict__,
                    "status": SessionStatus.EXPIRED,
                    "updated_at": normalize_timestamp(),
                    "version": record.version + 1,
                }
            )
            self._records[key] = record

        return record

    def create(
        self,
        tenant_id: str,
        user_id: str,
        name: str = "New session",
        *,
        session_id: str | None = None,
        ttl_seconds: int | None = None,
        metadata: Mapping[str, Any] | None = None,
        context: Mapping[str, Any] | None = None,
    ) -> SessionRecord:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        name = validate_session_name(name)

        if ttl_seconds is None:
            ttl_seconds = self._default_ttl_seconds
        elif ttl_seconds is not None:
            validate_positive_integer(ttl_seconds, "ttl_seconds")

        now = normalize_timestamp()
        expires_at = (
            now + timedelta(seconds=ttl_seconds)
            if ttl_seconds is not None
            else None
        )

        record = SessionRecord(
            session_id=session_id or new_session_id(),
            tenant_id=tenant_id,
            user_id=user_id,
            name=name,
            created_at=now,
            updated_at=now,
            expires_at=expires_at,
            metadata=validate_metadata(metadata),
            context=validate_context_item(dict(context or {})),
        )
        key = self._key(tenant_id, user_id, record.session_id)

        with self._lock:
            if key in self._records:
                raise SessionConflictError("session ID already exists in this scope")

            active_count = 0
            for existing_key, existing in self._records.items():
                if existing_key[:2] != (tenant_id, user_id):
                    continue
                current = self._get_locked(tenant_id, user_id, existing.session_id)
                if current.status == SessionStatus.ACTIVE:
                    active_count += 1

            if active_count >= self._max_sessions_per_user:
                raise SessionConflictError("active session limit reached")

            self._records[key] = record
            return record

    def get(
        self, tenant_id: str, user_id: str, session_id: str
    ) -> SessionRecord:
        with self._lock:
            return self._get_locked(tenant_id, user_id, session_id)

    def update(
        self,
        tenant_id: str,
        user_id: str,
        session_id: str,
        *,
        expected_version: int,
        name: str | None = None,
        metadata: Mapping[str, Any] | None = None,
        context_updates: Mapping[str, Any] | None = None,
        ttl_seconds: int | None = None,
    ) -> SessionRecord:
        validate_positive_integer(expected_version, "expected_version")
        if ttl_seconds is not None:
            validate_positive_integer(ttl_seconds, "ttl_seconds")

        key = self._key(tenant_id, user_id, session_id)
        with self._lock:
            current = self._get_locked(*key)
            if current.status != SessionStatus.ACTIVE:
                raise SessionConflictError("only active sessions can be updated")
            if current.version != expected_version:
                raise SessionConflictError("session version conflict")

            now = normalize_timestamp()
            new_name = validate_session_name(name) if name is not None else current.name
            new_metadata = (
                {**current.metadata, **validate_metadata(metadata)}
                if metadata is not None
                else dict(current.metadata)
            )
            new_context = (
                SessionContext.merge(current.context, context_updates)
                if context_updates is not None
                else dict(current.context)
            )
            expires_at = (
                now + timedelta(seconds=ttl_seconds)
                if ttl_seconds is not None
                else current.expires_at
            )

            updated = SessionRecord(
                session_id=current.session_id,
                tenant_id=current.tenant_id,
                user_id=current.user_id,
                name=new_name,
                status=current.status,
                created_at=current.created_at,
                updated_at=now,
                expires_at=expires_at,
                version=current.version + 1,
                metadata=new_metadata,
                context=new_context,
            )
            self._records[key] = updated
            return updated

    def close(
        self,
        tenant_id: str,
        user_id: str,
        session_id: str,
        *,
        expected_version: int | None = None,
    ) -> SessionRecord:
        key = self._key(tenant_id, user_id, session_id)
        with self._lock:
            current = self._get_locked(*key)

            if expected_version is not None:
                validate_positive_integer(expected_version, "expected_version")
                if current.version != expected_version:
                    raise SessionConflictError("session version conflict")

            if current.status == SessionStatus.CLOSED:
                return current
            if current.status == SessionStatus.EXPIRED:
                raise SessionConflictError("expired session cannot be closed")

            closed = SessionRecord(
                session_id=current.session_id,
                tenant_id=current.tenant_id,
                user_id=current.user_id,
                name=current.name,
                status=SessionStatus.CLOSED,
                created_at=current.created_at,
                updated_at=normalize_timestamp(),
                expires_at=current.expires_at,
                version=current.version + 1,
                metadata=current.metadata,
                context=current.context,
            )
            self._records[key] = closed
            return closed

    def list_sessions(
        self,
        tenant_id: str,
        user_id: str,
        *,
        limit: int = 50,
        include_closed: bool = False,
    ) -> list[SessionRecord]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 500:
            raise ValueError("limit must be between 1 and 500")
        if not isinstance(include_closed, bool):
            raise ValueError("include_closed must be a boolean")

        with self._lock:
            records = []
            for key, record in list(self._records.items()):
                if key[:2] != (tenant_id, user_id):
                    continue
                current = self._get_locked(tenant_id, user_id, record.session_id)
                if include_closed or current.status == SessionStatus.ACTIVE:
                    records.append(current)

            records.sort(key=lambda item: (item.updated_at, item.session_id), reverse=True)
            return records[:limit]

    def delete(
        self, tenant_id: str, user_id: str, session_id: str
    ) -> bool:
        key = self._key(tenant_id, user_id, session_id)
        with self._lock:
            return self._records.pop(key, None) is not None

    def count(self, tenant_id: str, user_id: str) -> int:
        return len(
            self.list_sessions(
                tenant_id, user_id, limit=500, include_closed=True
            )
        )
