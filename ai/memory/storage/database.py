from __future__ import annotations

import sqlite3
import threading
import uuid
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


SCHEMA_VERSION = 1


class MemoryDatabase:
    def __init__(
        self,
        database_path: str = "data/modelnow_memory.db",
        *,
        busy_timeout_ms: int = 5000,
    ) -> None:
        if (
            isinstance(busy_timeout_ms, bool)
            or not isinstance(busy_timeout_ms, int)
            or not 1 <= busy_timeout_ms <= 120000
        ):
            raise ValueError("busy_timeout_ms must be between 1 and 120000")

        if not isinstance(database_path, str) or not database_path.strip():
            raise ValueError("database_path must be a non-empty string")

        self.database_path = database_path
        self.busy_timeout_ms = busy_timeout_ms
        self._init_lock = threading.Lock()
        self._initialized = False
        self._closed = False
        self._keeper: sqlite3.Connection | None = None

        if database_path == ":memory:":
            self._connect_target = (
                f"file:modelnow_memory_{uuid.uuid4().hex}?mode=memory&cache=shared"
            )
            self._use_uri = True
            # Keep one connection alive so SQLite retains the shared in-memory DB.
            self._keeper = sqlite3.connect(
                self._connect_target,
                uri=True,
                timeout=busy_timeout_ms / 1000,
                isolation_level=None,
            )
            self._configure_connection(self._keeper)
        else:
            self._connect_target = database_path
            self._use_uri = database_path.startswith("file:")

    def _configure_connection(self, connection: sqlite3.Connection) -> None:
        connection.row_factory = sqlite3.Row
        connection.execute(f"PRAGMA busy_timeout = {self.busy_timeout_ms}")
        connection.execute("PRAGMA foreign_keys = ON")

    def _connect(self) -> sqlite3.Connection:
        if self._closed:
            raise RuntimeError("memory database is closed")

        if self.database_path != ":memory:" and not self._use_uri:
            Path(self.database_path).expanduser().resolve().parent.mkdir(
                parents=True, exist_ok=True
            )

        connection = sqlite3.connect(
            self._connect_target,
            uri=self._use_uri,
            timeout=self.busy_timeout_ms / 1000,
            isolation_level=None,
        )
        self._configure_connection(connection)
        return connection

    @contextmanager
    def connection(self) -> Iterator[sqlite3.Connection]:
        connection = self._connect()
        try:
            yield connection
        finally:
            connection.close()

    @contextmanager
    def transaction(self, *, immediate: bool = True) -> Iterator[sqlite3.Connection]:
        with self.connection() as connection:
            connection.execute("BEGIN IMMEDIATE" if immediate else "BEGIN")
            try:
                yield connection
            except BaseException:
                connection.rollback()
                raise
            else:
                connection.commit()

    def initialize(self) -> None:
        with self._init_lock:
            if self._closed:
                raise RuntimeError("memory database is closed")
            if self._initialized:
                return

            with self.connection() as connection:
                if self.database_path != ":memory:":
                    connection.execute("PRAGMA journal_mode = WAL")

                connection.execute("BEGIN IMMEDIATE")
                try:
                    connection.execute("""
                        CREATE TABLE IF NOT EXISTS memory_records (
                            tenant_id TEXT NOT NULL,
                            user_id TEXT NOT NULL,
                            memory_id TEXT NOT NULL,
                            memory_type TEXT NOT NULL,
                            content TEXT NOT NULL,
                            metadata_json TEXT NOT NULL,
                            created_at TEXT NOT NULL,
                            updated_at TEXT NOT NULL,
                            expires_at TEXT,
                            version INTEGER NOT NULL CHECK(version >= 1),
                            PRIMARY KEY (tenant_id, user_id, memory_id)
                        )
                    """)
                    connection.execute("""
                        CREATE INDEX IF NOT EXISTS idx_memory_records_scope_time
                        ON memory_records (tenant_id, user_id, created_at DESC)
                    """)
                    connection.execute("""
                        CREATE INDEX IF NOT EXISTS idx_memory_records_scope_type
                        ON memory_records (tenant_id, user_id, memory_type)
                    """)
                    connection.execute("""
                        CREATE TABLE IF NOT EXISTS memory_schema (
                            singleton_id INTEGER PRIMARY KEY CHECK(singleton_id = 1),
                            schema_version INTEGER NOT NULL
                        )
                    """)

                    row = connection.execute(
                        "SELECT schema_version FROM memory_schema WHERE singleton_id = 1"
                    ).fetchone()

                    if row is None:
                        connection.execute(
                            """
                            INSERT INTO memory_schema(singleton_id, schema_version)
                            VALUES(1, ?)
                            """,
                            (SCHEMA_VERSION,),
                        )
                    elif row["schema_version"] > SCHEMA_VERSION:
                        raise RuntimeError(
                            "database schema is newer than this application"
                        )
                    elif row["schema_version"] < SCHEMA_VERSION:
                        raise RuntimeError(
                            "database schema migration is required"
                        )

                    connection.commit()
                except BaseException:
                    connection.rollback()
                    raise

            self._initialized = True

    def health_check(self) -> bool:
        with self.connection() as connection:
            row = connection.execute("SELECT 1 AS healthy").fetchone()
            return row is not None and row["healthy"] == 1

    def close(self) -> None:
        with self._init_lock:
            if self._closed:
                return
            self._closed = True
            if self._keeper is not None:
                self._keeper.close()
                self._keeper = None
