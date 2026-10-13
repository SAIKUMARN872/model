from __future__ import annotations

import json
import sqlite3
from typing import Any, Mapping

from .database import MemoryDatabase
from .storage import MemoryStorageError
from .utils import validate_identifier, validate_metadata, validate_vector


class SQLiteVectorStore:
    def __init__(self, database: MemoryDatabase) -> None:
        self.database = database
        self.database.initialize()
        with self.database.connection() as connection:
            connection.execute("""
                CREATE TABLE IF NOT EXISTS memory_vectors (
                    tenant_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    memory_id TEXT NOT NULL,
                    embedding_model TEXT NOT NULL,
                    dimensions INTEGER NOT NULL CHECK(dimensions > 0),
                    vector_json TEXT NOT NULL,
                    metadata_json TEXT NOT NULL,
                    PRIMARY KEY (tenant_id, user_id, memory_id),
                    FOREIGN KEY (tenant_id, user_id, memory_id)
                        REFERENCES memory_records(tenant_id, user_id, memory_id)
                        ON DELETE CASCADE
                )
            """)

    def upsert(
        self,
        tenant_id: str,
        user_id: str,
        memory_id: str,
        vector: list[float] | tuple[float, ...],
        *,
        embedding_model: str,
        metadata: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        memory_id = validate_identifier(memory_id, "memory_id")
        embedding_model = validate_identifier(embedding_model, "embedding_model")
        vector = validate_vector(vector)
        metadata_json = json.dumps(
            validate_metadata(metadata), ensure_ascii=False, allow_nan=False
        )
        vector_json = json.dumps(vector, allow_nan=False, separators=(",", ":"))

        try:
            with self.database.transaction() as connection:
                parent = connection.execute(
                    """
                    SELECT 1 FROM memory_records
                    WHERE tenant_id = ? AND user_id = ? AND memory_id = ?
                    """,
                    (tenant_id, user_id, memory_id),
                ).fetchone()
                if parent is None:
                    raise ValueError("a memory record must exist before its vector is saved")

                connection.execute(
                    """
                    INSERT INTO memory_vectors (
                        tenant_id, user_id, memory_id, embedding_model,
                        dimensions, vector_json, metadata_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(tenant_id, user_id, memory_id) DO UPDATE SET
                        embedding_model = excluded.embedding_model,
                        dimensions = excluded.dimensions,
                        vector_json = excluded.vector_json,
                        metadata_json = excluded.metadata_json
                    """,
                    (
                        tenant_id, user_id, memory_id, embedding_model,
                        len(vector), vector_json, metadata_json,
                    ),
                )
        except ValueError:
            raise
        except sqlite3.Error as exc:
            raise MemoryStorageError("failed to save vector") from exc

        return {
            "tenant_id": tenant_id,
            "user_id": user_id,
            "memory_id": memory_id,
            "embedding_model": embedding_model,
            "dimensions": len(vector),
            "vector": vector,
            "metadata": json.loads(metadata_json),
        }

    def get(self, tenant_id: str, user_id: str, memory_id: str) -> dict[str, Any] | None:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        memory_id = validate_identifier(memory_id, "memory_id")

        try:
            with self.database.connection() as connection:
                row = connection.execute(
                    """
                    SELECT * FROM memory_vectors
                    WHERE tenant_id = ? AND user_id = ? AND memory_id = ?
                    """,
                    (tenant_id, user_id, memory_id),
                ).fetchone()
        except sqlite3.Error as exc:
            raise MemoryStorageError("failed to retrieve vector") from exc

        if row is None:
            return None
        return {
            "tenant_id": row["tenant_id"],
            "user_id": row["user_id"],
            "memory_id": row["memory_id"],
            "embedding_model": row["embedding_model"],
            "dimensions": row["dimensions"],
            "vector": json.loads(row["vector_json"]),
            "metadata": json.loads(row["metadata_json"]),
        }

    def delete(self, tenant_id: str, user_id: str, memory_id: str) -> bool:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        memory_id = validate_identifier(memory_id, "memory_id")
        try:
            with self.database.transaction() as connection:
                cursor = connection.execute(
                    """
                    DELETE FROM memory_vectors
                    WHERE tenant_id = ? AND user_id = ? AND memory_id = ?
                    """,
                    (tenant_id, user_id, memory_id),
                )
                return cursor.rowcount > 0
        except sqlite3.Error as exc:
            raise MemoryStorageError("failed to delete vector") from exc
