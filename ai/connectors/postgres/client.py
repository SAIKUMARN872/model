"""Read-only PostgreSQL client using psycopg 3."""
from __future__ import annotations

import re

from ai.connectors.exceptions import ConnectorConfigurationError, ConnectorRequestError

_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,62}$")


class PostgreSQLClient:
    def __init__(self, connection_factory, database, *, schema="public", max_rows=100):
        self._validate_identifier(database, "database")
        self._validate_identifier(schema, "schema")
        if isinstance(max_rows, bool) or not isinstance(max_rows, int) or not 1 <= max_rows <= 100:
            raise ValueError("max_rows must be from 1 to 100")
        self._connection_factory = connection_factory
        self._database = database
        self._schema = schema
        self._max_rows = max_rows

    @classmethod
    def from_environment(cls, config):
        import os

        host = os.getenv(config.host_env_var)
        user = os.getenv(config.user_env_var)
        password = os.getenv(config.password_env_var)
        port_text = os.getenv(config.port_env_var, "5432")

        if not host or not user or password is None:
            raise ConnectorConfigurationError(
                "PostgreSQL host, user, and password environment variables are required"
            )
        try:
            port = int(port_text)
        except ValueError:
            raise ConnectorConfigurationError("Invalid PostgreSQL port") from None
        if not 1 <= port <= 65535:
            raise ConnectorConfigurationError("Invalid PostgreSQL port")

        try:
            import psycopg
            from psycopg.rows import dict_row
        except ImportError:
            raise ConnectorConfigurationError(
                "Install psycopg[binary] to use PostgreSQL"
            ) from None

        def connect():
            return psycopg.connect(
                host=host,
                user=user,
                password=password,
                port=port,
                dbname=config.database,
                connect_timeout=config.timeout_seconds,
                sslmode="require",
                autocommit=True,
                row_factory=dict_row,
                options="-c default_transaction_read_only=on",
            )

        return cls(
            connect,
            config.database,
            schema=config.schema,
            max_rows=config.max_rows,
        )

    def _query(self, sql, params=()):
        connection = cursor = None
        try:
            connection = self._connection_factory()
            cursor = connection.cursor()
            cursor.execute(sql, params)
            return [dict(row) for row in cursor.fetchall()]
        except Exception:
            raise ConnectorRequestError("PostgreSQL read query failed") from None
        finally:
            if cursor is not None:
                try:
                    cursor.close()
                except Exception:
                    pass
            if connection is not None:
                try:
                    connection.close()
                except Exception:
                    pass

    def list_tables(self):
        rows = self._query(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = %s AND table_type = 'BASE TABLE' "
            "ORDER BY table_name",
            (self._schema,),
        )
        return [row["table_name"] for row in rows]

    def describe_table(self, table):
        self._validate_identifier(table, "table")
        return self._query(
            "SELECT column_name, data_type, is_nullable, ordinal_position "
            "FROM information_schema.columns "
            "WHERE table_schema = %s AND table_name = %s "
            "ORDER BY ordinal_position",
            (self._schema, table),
        )

    def select_rows(self, table, columns=None, filters=None, limit=50):
        self._validate_identifier(table, "table")
        columns = ["*"] if columns is None else columns
        if not isinstance(columns, list) or not columns or len(columns) > 50:
            raise ValueError("columns must be a non-empty list of at most 50")
        if any(c != "*" and not self._valid_identifier(c) for c in columns):
            raise ValueError("Invalid column identifier")
        if "*" in columns and columns != ["*"]:
            raise ValueError("Wildcard must be used alone")

        filters = {} if filters is None else filters
        if not isinstance(filters, dict) or len(filters) > 50:
            raise ValueError("filters must be an object with at most 50 entries")
        for name in filters:
            self._validate_identifier(name, "filter column")

        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= self._max_rows:
            raise ValueError("limit exceeds configured maximum")

        metadata = self.describe_table(table)
        available = {row["column_name"] for row in metadata}
        if not available:
            raise ConnectorRequestError("Table was not found")
        if columns != ["*"] and any(c not in available for c in columns):
            raise ValueError("Unknown column")
        if any(c not in available for c in filters):
            raise ValueError("Unknown filter column")

        select_sql = ", ".join(
            "*" if c == "*" else self._quote_identifier(c) for c in columns
        )
        sql = (
            f"SELECT {select_sql} FROM "
            f"{self._quote_identifier(self._schema)}.{self._quote_identifier(table)}"
        )
        params = []
        if filters:
            predicates = []
            for column, value in filters.items():
                quoted = self._quote_identifier(column)
                if value is None:
                    predicates.append(f"{quoted} IS NULL")
                else:
                    predicates.append(f"{quoted} = %s")
                    params.append(value)
            sql += " WHERE " + " AND ".join(predicates)
        sql += " LIMIT %s"
        params.append(limit)
        return self._query(sql, tuple(params))

    @staticmethod
    def _valid_identifier(value):
        return isinstance(value, str) and bool(_IDENTIFIER.fullmatch(value))

    @classmethod
    def _validate_identifier(cls, value, label):
        if not cls._valid_identifier(value):
            raise ValueError(f"Invalid PostgreSQL {label} identifier")

    @staticmethod
    def _quote_identifier(value):
        return '"' + value.replace('"', '""') + '"'
