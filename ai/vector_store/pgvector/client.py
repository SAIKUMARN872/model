import os
from typing import Any

from .utils import validate_collection_name, validate_dimension, quote_identifier


class PgVectorClient:
    def __init__(
        self,
        dsn: str | None = None,
        *,
        connect_timeout: int = 5,
        schema: str = "public",
    ) -> None:
        self.dsn = dsn or os.getenv("MODELNOW_PGVECTOR_DSN") or os.getenv(
            "DATABASE_URL"
        )
        if isinstance(connect_timeout, bool) or not isinstance(connect_timeout, int) or connect_timeout < 1:
            raise ValueError("connect_timeout must be a positive integer.")
        self.connect_timeout = connect_timeout
        self.schema = validate_collection_name(schema)
        self._connection = None

    @property
    def connected(self) -> bool:
        return self._connection is not None and not self._connection.closed

    def connect(self):
        if self.connected:
            return self._connection
        if not self.dsn:
            raise RuntimeError(
                "Set MODELNOW_PGVECTOR_DSN or DATABASE_URL before connecting."
            )

        try:
            import psycopg
        except ImportError as exc:
            raise RuntimeError(
                "Install PostgreSQL support with: pip install 'psycopg[binary]' pgvector"
            ) from exc

        try:
            self._connection = psycopg.connect(
                self.dsn,
                connect_timeout=self.connect_timeout,
                autocommit=False,
            )
            return self._connection
        except Exception as exc:
            self._connection = None
            raise ConnectionError(f"Could not connect to PostgreSQL: {exc}") from exc

    def ensure_connected(self):
        return self.connect()

    def execute(self, query: str, params: tuple | list | None = None):
        connection = self.ensure_connected()
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                return cursor
        except Exception:
            connection.rollback()
            raise

    def commit(self) -> None:
        if self.connected:
            self._connection.commit()

    def rollback(self) -> None:
        if self.connected:
            self._connection.rollback()

    def initialize(self) -> None:
        connection = self.ensure_connected()
        try:
            with connection.cursor() as cursor:
                cursor.execute("CREATE EXTENSION IF NOT EXISTS vector")
                cursor.execute(
                    f"CREATE SCHEMA IF NOT EXISTS {quote_identifier(self.schema)}"
                )
            connection.commit()
        except Exception:
            connection.rollback()
            raise

    def create_collection(
        self,
        collection_name: str,
        dimension: int,
        *,
        if_not_exists: bool = True,
    ) -> None:
        name = validate_collection_name(collection_name)
        dimension = validate_dimension(dimension)
        self.initialize()
        qualified = f"{quote_identifier(self.schema)}.{quote_identifier(name)}"
        clause = "IF NOT EXISTS " if if_not_exists else ""
        connection = self.ensure_connected()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    CREATE TABLE {clause}{qualified} (
                        document_id TEXT PRIMARY KEY,
                        text TEXT NOT NULL,
                        embedding VECTOR({dimension}) NOT NULL,
                        metadata JSONB NOT NULL DEFAULT '{{}}'::jsonb,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                    """
                )
            connection.commit()
        except Exception:
            connection.rollback()
            raise

    def collection_exists(self, collection_name: str) -> bool:
        name = validate_collection_name(collection_name)
        connection = self.ensure_connected()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = %s AND table_name = %s
                )
                """,
                (self.schema, name),
            )
            return bool(cursor.fetchone()[0])

    def list_collections(self) -> list[str]:
        connection = self.ensure_connected()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT table_name FROM information_schema.tables
                WHERE table_schema = %s
                ORDER BY table_name
                """,
                (self.schema,),
            )
            return [row[0] for row in cursor.fetchall()]

    def delete_collection(self, collection_name: str) -> bool:
        name = validate_collection_name(collection_name)
        qualified = f"{quote_identifier(self.schema)}.{quote_identifier(name)}"
        connection = self.ensure_connected()
        try:
            with connection.cursor() as cursor:
                cursor.execute(f"DROP TABLE IF EXISTS {qualified}")
                deleted = cursor.rowcount > 0
            connection.commit()
            return deleted
        except Exception:
            connection.rollback()
            raise

    def close(self) -> None:
        if self._connection is not None:
            try:
                self._connection.close()
            finally:
                self._connection = None

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is not None:
            self.rollback()
        self.close()
        return False
