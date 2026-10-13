"""Tests for MCP connector adapters."""

import asyncio
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from .api import MCPAPIConnector, MCPAPIResponse
from .connector import ConnectorState, MCPConnector, MCPConnectorError
from .database import MCPDatabaseConnector
from .utils import validate_http_url, validate_max_bytes, validate_name


class ConnectorUtilsTests(unittest.TestCase):
    def test_name_validation(self):
        self.assertEqual(validate_name(" demo "), "demo")
        with self.assertRaises(ValueError):
            validate_name(" ")

    def test_http_url_validation(self):
        self.assertEqual(
            validate_http_url("https://api.example.com/x",
                              {"api.example.com"}),
            "https://api.example.com/x",
        )
        with self.assertRaises(ValueError):
            validate_http_url("file:///tmp/x")
        with self.assertRaises(ValueError):
            validate_http_url("https://other.example.com", {"api.example.com"})

    def test_response_size_validation(self):
        self.assertEqual(validate_max_bytes(100), 100)
        with self.assertRaises(ValueError):
            validate_max_bytes(0)


class BaseConnectorTests(unittest.IsolatedAsyncioTestCase):
    async def test_lifecycle_and_closed_state(self):
        class Dummy(MCPConnector):
            async def _connect(self):
                return None

            async def _close(self):
                return None

        connector = Dummy("dummy")
        self.assertEqual(connector.state, ConnectorState.DISCONNECTED)
        await connector.connect()
        self.assertTrue(connector.connected)
        await connector.close()
        self.assertEqual(connector.state, ConnectorState.CLOSED)
        with self.assertRaises(MCPConnectorError):
            await connector.connect()

    async def test_operation_requires_connection(self):
        connector = MCPDatabaseConnector("db", "missing.sqlite")
        with self.assertRaises(MCPConnectorError):
            connector.require_connected()


class APIConnectorTests(unittest.IsolatedAsyncioTestCase):
    async def test_allowlist_is_required(self):
        with self.assertRaises(ValueError):
            MCPAPIConnector("api", allowed_hosts=[])

    async def test_rejects_unlisted_host(self):
        connector = MCPAPIConnector(
            "api", allowed_hosts=["api.example.com"]
        )
        await connector.connect()
        with self.assertRaises(ValueError):
            await connector.request("GET", "https://evil.example.org")
        await connector.close()

    async def test_request_and_json_response(self):
        connector = MCPAPIConnector(
            "api", allowed_hosts=["api.example.com"]
        )
        await connector.connect()
        fake = MCPAPIResponse(
            200, {"Content-Type": "application/json"},
            json.dumps({"ok": True}).encode(),
        )
        with patch("ai.mcp.connectors.api.urlopen") as opener:
            response_context = opener.return_value.__enter__.return_value
            response_context.status = 200
            response_context.headers.items.return_value = [
                ("Content-Type", "application/json")
            ]
            response_context.read.return_value = fake.body
            response = await connector.request(
                "GET", "https://api.example.com/data"
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"ok": True})
        await connector.close()


class DatabaseConnectorTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = str(Path(self.temp.name) / "test.sqlite")
        connection = sqlite3.connect(self.path)
        connection.execute("CREATE TABLE items (id INTEGER, name TEXT)")
        connection.execute(
            "INSERT INTO items VALUES (?, ?)", (1, "ModelNow")
        )
        connection.commit()
        connection.close()

    async def asyncTearDown(self):
        self.temp.cleanup()

    async def test_read_query(self):
        connector = MCPDatabaseConnector("db", self.path)
        await connector.connect()
        result = await connector.execute(
            "SELECT id, name FROM items WHERE id = ?", (1,)
        )
        self.assertEqual(result.row_count, 1)
        self.assertEqual(result.to_dicts(), [{"id": 1, "name": "ModelNow"}])
        await connector.close()

    async def test_read_only_rejects_write(self):
        connector = MCPDatabaseConnector("db", self.path)
        await connector.connect()
        with self.assertRaises(MCPConnectorError):
            await connector.execute("DELETE FROM items")
        await connector.close()

    async def test_sql_parameters_are_supported(self):
        connector = MCPDatabaseConnector("db", self.path)
        await connector.connect()
        result = await connector.execute(
            "SELECT name FROM items WHERE name = ?", ("ModelNow",)
        )
        self.assertEqual(result.rows, (("ModelNow",),))
        await connector.close()

    async def test_missing_database_rejected(self):
        connector = MCPDatabaseConnector(
            "db", str(Path(self.temp.name) / "missing.sqlite")
        )
        with self.assertRaises(MCPConnectorError):
            await connector.connect()

    async def test_write_requires_explicit_opt_in(self):
        connector = MCPDatabaseConnector(
            "db", self.path, allow_write=True
        )
        await connector.connect()
        result = await connector.execute(
            "INSERT INTO items VALUES (?, ?)", (2, "Second")
        )
        self.assertEqual(result.row_count, 1)
        await connector.close()


if __name__ == "__main__":
    unittest.main()