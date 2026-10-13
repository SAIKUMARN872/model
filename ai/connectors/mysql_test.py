"""MySQL connector tests use a fake client; no database is required."""

import unittest

from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.mysql import (
    MySQLClient,
    MySQLConnector,
    create_mysql_config,
    register_mysql_connector,
)


class FakeMySQLClient:
    def __init__(self):
        self.calls = []

    def list_tables(self):
        self.calls.append(("list_tables",))
        return ["users"]

    def describe_table(self, table):
        self.calls.append(("describe_table", table))
        return [{"COLUMN_NAME": "id"}, {"COLUMN_NAME": "name"}]

    def select_rows(self, table, columns=None, filters=None, limit=50):
        self.calls.append(("select_rows", table, columns, filters, limit))
        return [{"id": 1, "name": "Ada"}]


class MySQLTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = create_mysql_config("app")
        self.client = FakeMySQLClient()
        self.connector = MySQLConnector(self.config, self.client)

    async def test_list_tables(self):
        result = await self.connector.execute(
            ConnectorRequest("list_tables", {}), {}
        )
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
                "table": "users",
                "columns": ["id", "name"],
                "filters": {"id": 1},
                "limit": 5,
            }),
            {},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][1:], (
            "users", ["id", "name"], {"id": 1}, 5
        ))

    async def test_rejects_arbitrary_sql_argument(self):
        result = await self.connector.execute(
            ConnectorRequest("select_rows", {
                "table": "users", "sql": "DROP TABLE users",
            }),
            {},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_injection_table_name(self):
        result = await self.connector.execute(
            ConnectorRequest("select_rows", {
                "table": "users; DROP TABLE users",
            }),
            {},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_unknown_column_format(self):
        result = await self.connector.execute(
            ConnectorRequest("select_rows", {
                "table": "users", "columns": ["id; DROP TABLE users"],
            }),
            {},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_excessive_limit(self):
        config = create_mysql_config("app", max_rows=10)
        connector = MySQLConnector(config, self.client)
        result = await connector.execute(
            ConnectorRequest("select_rows", {
                "table": "users", "limit": 11,
            }),
            {},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_unknown_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("execute_sql", {"sql": "SELECT 1"}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_database_name(self):
        with self.assertRaises(ValueError):
            create_mysql_config("app; DROP DATABASE prod")

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_mysql_connector(
            registry, self.config, client=self.client
        )
        self.assertIs(registry.get("mysql"), connector)

    async def test_client_rejects_invalid_database_identifier(self):
        with self.assertRaises(ValueError):
            MySQLClient(lambda: None, "app; DROP")


if __name__ == "__main__":
    unittest.main()
