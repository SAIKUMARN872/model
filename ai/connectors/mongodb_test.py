"""MongoDB connector tests using a fake client; no database required."""

import unittest

from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.mongodb import (
    MongoDBConnector,
    MongoDBClient,
    create_mongodb_config,
    register_mongodb_connector,
    validate_mongodb_uri,
)


class FakeMongoClient:
    _uri = "mongodb://localhost:27017"

    def __init__(self):
        self.calls = []

    def list_databases(self):
        self.calls.append(("list_databases",))
        return ["app", "admin"]

    def list_collections(self):
        self.calls.append(("list_collections",))
        return ["users"]

    def find_documents(self, collection, filter_document, limit, projection=None):
        self.calls.append(("find_documents", collection, filter_document, limit, projection))
        return [{"name": "Ada"}]


class MongoDBTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = create_mongodb_config("app")
        self.client = FakeMongoClient()
        self.connector = MongoDBConnector(self.config, self.client)

    async def test_list_databases(self):
        result = await self.connector.execute(
            ConnectorRequest("list_databases", {}), {"uri": self.client._uri}
        )
        self.assertTrue(result.success)
        self.assertEqual(result.data, ["app", "admin"])

    async def test_list_collections(self):
        result = await self.connector.execute(
            ConnectorRequest("list_collections", {}), {"uri": self.client._uri}
        )
        self.assertTrue(result.success)
        self.assertEqual(result.data, ["users"])

    async def test_find_documents_with_bounded_filter(self):
        result = await self.connector.execute(
            ConnectorRequest("find_documents", {
                "collection": "users",
                "filter": {"age": {"$gte": 18}},
                "limit": 10,
                "projection": {"name": 1},
            }),
            {"uri": self.client._uri},
        )
        self.assertTrue(result.success)
        self.assertEqual(result.data, [{"name": "Ada"}])
        self.assertEqual(self.client.calls[0][3], 10)

    async def test_missing_uri_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("list_collections", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("drop_database", {}), {"uri": self.client._uri}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_write_like_filter_operator_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("find_documents", {
                "collection": "users",
                "filter": {"$where": "this.age > 0"},
            }),
            {"uri": self.client._uri},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_argument_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("find_documents", {
                "collection": "users",
                "arbitrary_command": "dropDatabase",
            }),
            {"uri": self.client._uri},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_limit_above_configured_maximum_rejected(self):
        config = create_mongodb_config("app", max_documents=20)
        connector = MongoDBConnector(config, self.client)
        result = await connector.execute(
            ConnectorRequest("find_documents", {
                "collection": "users", "limit": 21,
            }),
            {"uri": self.client._uri},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_uri_scheme_validation(self):
        self.assertEqual(
            validate_mongodb_uri("mongodb://localhost:27017"),
            "mongodb://localhost:27017",
        )
        with self.assertRaises(ValueError):
            validate_mongodb_uri("https://example.com")

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_mongodb_connector(
            registry, self.config, client=self.client
        )
        self.assertIs(registry.get("mongodb"), connector)

    async def test_uri_rejected_when_missing(self):
        with self.assertRaises(ValueError):
            MongoDBClient("", "app")


if __name__ == "__main__":
    unittest.main()
