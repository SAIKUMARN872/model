"""PostgreSQL connector tests use a fake client; no database is required."""
import unittest

from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.postgres import (
    PostgreSQLClient,
    PostgreSQLConnector,
    create_postgres_config,
    register_postgres_connector,
)


class FakePostgreSQLClient:
    def __init__(self):
        self.calls = []

    def list_tables(self):
        self.calls.append(("list_tables",))
        return ["users"]

    def describe_table(self, table):
        self.calls.append(("describe_table", table))
        return [{"column_name": "id"}, {"column_name": "name"}]

    def select_rows(self, table, columns=None, filters=None, limit=50):
        self.calls.append(("select_rows", table, columns, filters, limit))
        return [{"id": 1, "name": "Ada"}]


class PostgreSQLTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = create_postgres_config("app")
        self.client = FakePostgreSQLClient()
        self.connector = PostgreSQLConnector(self.config, self.client)

    async def test_list_tables(self):
        result = await self.connector.execute(ConnectorRequest("list_tables", {}), {})
        self.assertTrue(result.success)
        self.assertEqual(result.data, ["users"])

    async def test_describe_table(self):
        result = await self.connector.execute(
            ConnectorRequest("describe_table", {"table": "users"}), {}
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1], ("describe_table", "users"))

    async def test_select_rows(self):
        result = await self.connector.execute(
            ConnectorRequest("select_rows", {
                "table": "users", "columns": ["id", "name"],
                "filters": {"id": 1}, "limit": 5,
            }), {},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1], (
            "select_rows", "users", ["id", "name"], {"id": 1}, 5
        ))

    async def test_rejects_arbitrary_sql(self):
        result = await self.connector.execute(
            ConnectorRequest("select_rows", {"table": "users", "sql": "DROP TABLE users"}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_injection_table_name(self):
        result = await self.connector.execute(
            ConnectorRequest("select_rows", {"table": "users; DROP TABLE users"}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_column(self):
        result = await self.connector.execute(
            ConnectorRequest("select_rows", {"table": "users", "columns": ["id; DROP TABLE users"]}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_excessive_limit(self):
        connector = PostgreSQLConnector(
            create_postgres_config("app", max_rows=10), self.client
        )
        result = await connector.execute(
            ConnectorRequest("select_rows", {"table": "users", "limit": 11}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_unknown_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("execute_sql", {"sql": "SELECT 1"}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_database_and_schema(self):
        with self.assertRaises(ValueError):
            create_postgres_config("app; DROP DATABASE prod")
        with self.assertRaises(ValueError):
            create_postgres_config("app", schema="../admin")

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_postgres_connector(
            registry, self.config, client=self.client
        )
        self.assertIs(registry.get("postgres"), connector)

    async def test_client_rejects_invalid_database_identifier(self):
        with self.assertRaises(ValueError):
            PostgreSQLClient(lambda: None, "app; DROP")

    async def test_client_rejects_invalid_schema_identifier(self):
        with self.assertRaises(ValueError):
            PostgreSQLClient(lambda: None, "app", schema="public; DROP")


if __name__ == "__main__":
    unittest.main()
