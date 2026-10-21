"""MySQL client with read-only operations."""

import re

from ai.connectors.exceptions import ConnectorConfigurationError, ConnectorRequestError


_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,63}$")


class MySQLClient:
    def __init__(self, connection_factory, database, *, max_rows=100):
        if not _IDENTIFIER.fullmatch(database):
            raise ValueError("Invalid database identifier")
        if not 1 <= max_rows <= 100:
            raise ValueError("max_rows must be from 1 to 100")
        self._connection_factory = connection_factory
        self._database = database
        self._max_rows = max_rows

    @classmethod
    def from_environment(cls, config):
        import os

        host = os.getenv(config.host_env_var)
        user = os.getenv(config.user_env_var)
        password = os.getenv(config.password_env_var)
        port_text = os.getenv(config.port_env_var, "3306")

        if not host or not user or password is None:
            raise ConnectorConfigurationError(
                "MySQL host, user, and password environment variables are required"
            )
        try:
            port = int(port_text)
        except ValueError as exc:
            raise ConnectorConfigurationError("Invalid MySQL port") from exc
        if not 1 <= port <= 65535:
            raise ConnectorConfigurationError("Invalid MySQL port")

        try:
            import mysql.connector
        except ImportError as exc:
            raise ConnectorConfigurationError(
                "Install mysql-connector-python to use MySQL"
            ) from exc

        def connect():
            return mysql.connector.connect(
                host=host,
                user=user,
                password=password,
                port=port,
                database=config.database,
                connection_timeout=config.timeout_seconds,
                autocommit=True,
                ssl_disabled=False,
            )

        return cls(connect, config.database, max_rows=config.max_rows)

    def _query(self, sql, params=()):
        connection = None
        cursor = None
        try:
            connection = self._connection_factory()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(sql, params)
            return list(cursor.fetchall())
        except Exception as exc:
            raise ConnectorRequestError("MySQL read query failed") from exc
        finally:
            if cursor is not None:
                cursor.close()
            if connection is not None:
                connection.close()

    def list_tables(self):
        rows = self._query(
            "SELECT TABLE_NAME FROM information_schema.tables "
            "WHERE TABLE_SCHEMA = %s ORDER BY TABLE_NAME",
            (self._database,),
        )
        return [row["TABLE_NAME"] for row in rows]

    def describe_table(self, table):
        self._validate_identifier(table)
        rows = self._query(
            "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY "
            "FROM information_schema.columns "
            "WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s "
            "ORDER BY ORDINAL_POSITION",
            (self._database, table),
        )
        return rows

    def select_rows(self, table, columns=None, filters=None, limit=50):
        self._validate_identifier(table)
        columns = columns or ["*"]
        if not isinstance(columns, list) or not columns:
            raise ValueError("columns must be a non-empty list")
        for column in columns:
            if column != "*":
                self._validate_identifier(column)

        if filters is None:
            filters = {}
        if not isinstance(filters, dict):
            raise ValueError("filters must be an object")
        for key in filters:
            self._validate_identifier(key)

        if isinstance(limit, bool) or not isinstance(limit, int):
            raise ValueError("limit must be an integer")
        if not 1 <= limit <= self._max_rows:
            raise ValueError("limit exceeds configured maximum")

        # Confirm requested columns exist before querying table data.
        metadata = self.describe_table(table)
        available = {row["COLUMN_NAME"] for row in metadata}
        if not available:
            raise ConnectorRequestError("Table was not found")
        if columns != ["*"] and any(column not in available for column in columns):
            raise ValueError("Unknown column")

        if any(key not in available for key in filters):
            raise ValueError("Unknown filter column")

        select_sql = ", ".join(
            "*" if column == "*" else f"`{column}`" for column in columns
        )
        sql = f"SELECT {select_sql} FROM `{table}`"
        params = []
        if filters:
            predicates = []
            for column, value in filters.items():
                if value is None:
                    predicates.append(f"`{column}` IS NULL")
                else:
                    predicates.append(f"`{column}` = %s")
                    params.append(value)
            sql += " WHERE " + " AND ".join(predicates)
        sql += " LIMIT %s"
        params.append(limit)
        return self._query(sql, tuple(params))

    @staticmethod
    def _validate_identifier(value):
        if not isinstance(value, str) or not _IDENTIFIER.fullmatch(value):
            raise ValueError("Invalid SQL identifier")
