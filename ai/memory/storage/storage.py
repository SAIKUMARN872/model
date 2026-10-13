from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import timedelta
from typing import Any, Mapping

from .database import MemoryDatabase
from .utils import (
    normalize_timestamp,
    parse_timestamp,
    timestamp_to_text,
    validate_identifier,
    validate_metadata,
)


class MemoryStorageError(RuntimeError):
    pass


class MemoryRecordNotFoundError(LookupError):
    pass


class MemoryVersionConflictError(RuntimeError):
    pass


class SQLiteMemoryStorage:
    def __init__(self, database: MemoryDatabase) -> None:
        self.database = database
        self.database.initialize()

    def save(
        self,
        tenant_id: str,
        user_id: str,
        content: str,
        *,
        memory_id: str | None = None,
        memory_type: str = "long_term",
        metadata: Mapping[str, Any] | None = None,
        expires_at=None,
    ) -> dict[str, Any]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        memory_id = validate_identifier(memory_id or str(uuid.uuid4()), "memory_id")
        memory_type = validate_identifier(memory_type, "memory_type")

        if not isinstance(content, str) or not content.strip():
            raise ValueError("content must be a non-empty string")

        metadata_json = json.dumps(
            validate_metadata(metadata),
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        )
        now = normalize_timestamp()
        created_at = timestamp_to_text(now)
        expires_text = timestamp_to_text(expires_at) if expires_at is not None else None

        try:
            with self.database.transaction() as connection:
                connection.execute(
                    """
                    INSERT INTO memory_records (
                        tenant_id, user_id, memory_id, memory_type, content,
                        metadata_json, created_at, updated_at, expires_at, version
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                    """,
                    (
                        tenant_id, user_id, memory_id, memory_type, content,
                        metadata_json, created_at, created_at, expires_text,
                    ),
                )
        except sqlite3.IntegrityError as exc:
            raise MemoryVersionConflictError(
                "memory ID already exists in this tenant/user scope"
            ) from exc
        except sqlite3.Error as exc:
            raise MemoryStorageError("failed to save memory") from exc

        result = self.get(tenant_id, user_id, memory_id)
        if result is None:
            raise MemoryStorageError("saved memory could not be read back")
        return result

    def get(
        self, tenant_id: str, user_id: str, memory_id: str
    ) -> dict[str, Any] | None:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        memory_id = validate_identifier(memory_id, "memory_id")

        try:
            with self.database.connection() as connection:
                row = connection.execute(
                    """
                    SELECT * FROM memory_records
                    WHERE tenant_id = ? AND user_id = ? AND memory_id = ?
                    """,
                    (tenant_id, user_id, memory_id),
                ).fetchone()
        except sqlite3.Error as exc:
            raise MemoryStorageError("failed to retrieve memory") from exc

        return self._deserialize(row) if row is not None else None

    def update(
        self,
        tenant_id: str,
        user_id: str,
        memory_id: str,
        *,
        expected_version: int,
        content: str | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        memory_id = validate_identifier(memory_id, "memory_id")

        if isinstance(expected_version, bool) or not isinstance(expected_version, int) or expected_version < 1:
            raise ValueError("expected_version must be a positive integer")
        if content is not None and (not isinstance(content, str) or not content.strip()):
            raise ValueError("content must be a non-empty string")

        try:
            with self.database.transaction() as connection:
                row = connection.execute(
                    """
                    SELECT * FROM memory_records
                    WHERE tenant_id = ? AND user_id = ? AND memory_id = ?
                    """,
                    (tenant_id, user_id, memory_id),
                ).fetchone()

                if row is None:
                    raise MemoryRecordNotFoundError("memory not found")

                if row["version"] != expected_version:
                    raise MemoryVersionConflictError("memory version conflict")

                old_metadata = json.loads(row["metadata_json"])
                merged_metadata = (
                    {**old_metadata, **validate_metadata(metadata)}
                    if metadata is not None else old_metadata
                )
                updated_content = content if content is not None else row["content"]
                now = timestamp_to_text()

                cursor = connection.execute(
                    """
                    UPDATE memory_records
                    SET content = ?, metadata_json = ?, updated_at = ?, version = version + 1
                    WHERE tenant_id = ? AND user_id = ? AND memory_id = ? AND version = ?
                    """,
                    (
                        updated_content,
                        json.dumps(merged_metadata, ensure_ascii=False, allow_nan=False),
                        now, tenant_id, user_id, memory_id, expected_version,
                    ),
                )
                if cursor.rowcount != 1:
                    raise MemoryVersionConflictError("memory version conflict")

        except (MemoryRecordNotFoundError, MemoryVersionConflictError, ValueError):
            raise
        except sqlite3.Error as exc:
            raise MemoryStorageError("failed to update memory") from exc

        result = self.get(tenant_id, user_id, memory_id)
        if result is None:
            raise MemoryStorageError("updated memory could not be read back")
        return result

    def delete(self, tenant_id: str, user_id: str, memory_id: str) -> bool:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        memory_id = validate_identifier(memory_id, "memory_id")

        try:
            with self.database.transaction() as connection:
                cursor = connection.execute(
                    """
                    DELETE FROM memory_records
                    WHERE tenant_id = ? AND user_id = ? AND memory_id = ?
                    """,
                    (tenant_id, user_id, memory_id),
                )
                return cursor.rowcount > 0
        except sqlite3.Error as exc:
            raise MemoryStorageError("failed to delete memory") from exc

    def search(
        self,
        tenant_id: str,
        user_id: str,
        *,
        memory_type: str | None = None,
        limit: int = 50,
        include_expired: bool = False,
    ) -> list[dict[str, Any]]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")

        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 500:
            raise ValueError("limit must be between 1 and 500")
        if not isinstance(include_expired, bool):
            raise ValueError("include_expired must be a boolean")

        clauses = ["tenant_id = ?", "user_id = ?"]
        params: list[Any] = [tenant_id, user_id]
        if memory_type is not None:
            clauses.append("memory_type = ?")
            params.append(validate_identifier(memory_type, "memory_type"))
        if not include_expired:
            clauses.append("(expires_at IS NULL OR expires_at > ?)")
            params.append(timestamp_to_text())

        params.append(limit)
        sql = (
            "SELECT * FROM memory_records WHERE "
            + " AND ".join(clauses)
            + " ORDER BY created_at DESC, memory_id ASC LIMIT ?"
        )

        try:
            with self.database.connection() as connection:
                rows = connection.execute(sql, params).fetchall()
        except sqlite3.Error as exc:
            raise MemoryStorageError("failed to search memories") from exc

        return [self._deserialize(row) for row in rows]

    def purge_expired(self, tenant_id: str | None = None, user_id: str | None = None) -> int:
        if (tenant_id is None) != (user_id is None):
            raise ValueError("tenant_id and user_id must be supplied together")

        now = timestamp_to_text()
        try:
            with self.database.transaction() as connection:
                if tenant_id is None:
                    cursor = connection.execute(
                        "DELETE FROM memory_records WHERE expires_at IS NOT NULL AND expires_at <= ?",
                        (now,),
                    )
                else:
                    tenant_id = validate_identifier(tenant_id, "tenant_id")
                    user_id = validate_identifier(user_id, "user_id")
                    cursor = connection.execute(
                        """
                        DELETE FROM memory_records
                        WHERE tenant_id = ? AND user_id = ?
                          AND expires_at IS NOT NULL AND expires_at <= ?
                        """,
                        (tenant_id, user_id, now),
                    )
                return cursor.rowcount
        except sqlite3.Error as exc:
            raise MemoryStorageError("failed to purge expired memories") from exc

    @staticmethod
    def _deserialize(row: sqlite3.Row) -> dict[str, Any]:
        try:
            return {
                "tenant_id": row["tenant_id"],
                "user_id": row["user_id"],
                "memory_id": row["memory_id"],
                "memory_type": row["memory_type"],
                "content": row["content"],
                "metadata": json.loads(row["metadata_json"]),
                "created_at": parse_timestamp(row["created_at"]),
                "updated_at": parse_timestamp(row["updated_at"]),
                "expires_at": (
                    parse_timestamp(row["expires_at"])
                    if row["expires_at"] else None
                ),
                "version": row["version"],
            }
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            raise MemoryStorageError("stored memory record is invalid") from exc
