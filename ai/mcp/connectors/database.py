"""SQLite connector with read-only default access."""

import asyncio
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .connector import MCPConnector, MCPConnectorError


@dataclass(frozen=True)
class MCPQueryResult:
    columns: tuple[str, ...]
    rows: tuple[tuple[Any, ...], ...]
    row_count: int

    def to_dicts(self) -> list[dict[str, Any]]:
        return [
            dict(zip(self.columns, row, strict=True))
            for row in self.rows
        ]


class MCPDatabaseConnector(MCPConnector):
    """SQLite connector; writes require explicit allow_write=True."""

    def __init__(
        self,
        name: str,
        database_path: str,
        *,
        allow_write: bool = False,
        query_timeout_seconds: float = 5.0,
    ) -> None:
        super().__init__(name)
        if not isinstance(database_path, str) or not database_path.strip():
            raise ValueError("database_path must be a non-empty path.")
        if isinstance(query_timeout_seconds, bool) or not isinstance(
            query_timeout_seconds, (int, float)
        ) or query_timeout_seconds <= 0:
            raise ValueError("query_timeout_seconds must be positive.")

        self.database_path = str(Path(database_path).expanduser().resolve())
        self.allow_write = bool(allow_write)
        self.query_timeout_seconds = float(query_timeout_seconds)
        self._connection: sqlite3.Connection | None = None
        self._db_lock = asyncio.Lock()

    async def _connect(self) -> None:
        path = Path(self.database_path)
        if not path.is_file():
            raise MCPConnectorError(
                "SQLite database file does not exist; create it explicitly first."
            )

        mode = "rwc" if self.allow_write else "ro"
        uri = path.as_uri() + f"?mode={mode}"

        try:
            self._connection = await asyncio.to_thread(
                sqlite3.connect,
                uri,
                uri=True,
                check_same_thread=False,
                timeout=self.query_timeout_seconds,
            )
            self._connection.row_factory = None
            self._connection.set_progress_handler(
                lambda: 1, 0
            )
        except sqlite3.Error as exc:
            self._connection = None
            raise MCPConnectorError(f"SQLite connection failed: {exc}") from exc

    async def _close(self) -> None:
        connection, self._connection = self._connection, None
        if connection is not None:
            await asyncio.to_thread(connection.close)

    @staticmethod
    def _is_read_query(query: str) -> bool:
        # Conservative first-token guard; SQLite read-only mode is the
        # authoritative protection when allow_write=False.
        stripped = query.lstrip()
        if stripped.startswith("--"):
            lines = stripped.splitlines()
            stripped = "\n".join(
                line for line in lines if not line.lstrip().startswith("--")
            ).lstrip()
        if stripped.startswith("/*"):
            end = stripped.find("*/")
            if end < 0:
                return False
            stripped = stripped[end + 2:].lstrip()
        first = stripped.split(None, 1)[0].casefold() if stripped else ""
        return first in {"select", "with", "explain"}

    async def execute(
        self,
        query: str,
        parameters: tuple | list | dict | None = None,
    ) -> MCPQueryResult:
        self.require_connected()
        if not isinstance(query, str) or not query.strip():
            raise ValueError("SQL query must be a non-empty string.")
        if not self.allow_write and not self._is_read_query(query):
            raise MCPConnectorError(
                "Read-only mode accepts SELECT, WITH, and EXPLAIN queries only."
            )
        if parameters is None:
            parameters = ()
        if not isinstance(parameters, (tuple, list, dict)):
            raise TypeError("SQL parameters must be a tuple, list, dict, or None.")

        async with self._db_lock:
            connection = self._connection
            if connection is None:
                raise MCPConnectorError("SQLite connection is unavailable.")

            def run_query():
                try:
                    cursor = connection.execute(query, parameters)
                    if cursor.description is None:
                        connection.commit()
                        return MCPQueryResult((), (), cursor.rowcount)
                    columns = tuple(item[0] for item in cursor.description)
                    rows = tuple(tuple(row) for row in cursor.fetchall())
                    return MCPQueryResult(columns, rows, len(rows))
                except sqlite3.Error as exc:
                    raise MCPConnectorError(f"SQLite query failed: {exc}") from exc

            return await asyncio.to_thread(run_query)