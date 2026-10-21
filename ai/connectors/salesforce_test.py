"""Mock-based tests for the read-only Salesforce connector."""
import unittest

from ai.connectors.exceptions import ConnectorConfigurationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.salesforce import (
    SalesforceConnector,
    SalesforceConfig,
    register_salesforce_connector,
)
from ai.connectors.salesforce.schemas import validate_soql


class FakeSalesforceClient:
    def __init__(self):
        self.calls = []

    def request(self, method, path, *, query=None, access_token=None):
        self.calls.append((method, path, query, access_token))
        return {"records": [], "done": True}


class SalesforceTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = SalesforceConfig(
            instance_url="https://example.my.salesforce.com",
            allowed_hosts=("example.my.salesforce.com",),
        )
        self.client = FakeSalesforceClient()
        self.connector = SalesforceConnector(self.config, self.client)

    async def test_list_objects(self):
        result = await self.connector.execute(
            ConnectorRequest("list_objects", {}), {"access_token": "fake"}
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][1], "sobjects/")

    async def test_get_record(self):
        result = await self.connector.execute(
            ConnectorRequest("get_record", {
                "object_name": "Account",
                "record_id": "001000000000001AAA",
            }), {"access_token": "fake"}
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[-1][1],
            "sobjects/Account/001000000000001AAA",
        )

    async def test_query_records(self):
        query = "SELECT Id, Name FROM Account LIMIT 10"
        result = await self.connector.execute(
            ConnectorRequest("query_records", {"soql": query}),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][2], {"q": query})

    async def test_missing_token_fails_safely(self):
        result = await self.connector.execute(
            ConnectorRequest("list_objects", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_record", {"record_id": "001000000000001AAA"}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_record_id_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("get_record", {
                "object_name": "Account", "record_id": "../admin",
            }), {"access_token": "fake"}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_object_name_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("get_record", {
                "object_name": "Account/../User",
                "record_id": "001000000000001AAA",
            }), {"access_token": "fake"}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_mutating_soql_rejected(self):
        for query in (
            "DELETE FROM Account",
            "SELECT Id FROM Account; DELETE FROM Account",
            "SELECT Id FROM Account FOR UPDATE",
            "SELECT Id FROM Account -- comment",
        ):
            with self.subTest(query=query):
                with self.assertRaises(Exception):
                    validate_soql(query)

    async def test_non_select_query_rejected(self):
        with self.assertRaises(Exception):
            validate_soql("UPDATE Account SET Name='x'")

    async def test_rejects_http_url(self):
        with self.assertRaises(ConnectorConfigurationError):
            SalesforceConfig(
                instance_url="http://example.my.salesforce.com",
                allowed_hosts=("example.my.salesforce.com",),
            )

    async def test_rejects_unallowlisted_host(self):
        with self.assertRaises(ConnectorConfigurationError):
            SalesforceConfig(
                instance_url="https://evil.example",
                allowed_hosts=("example.my.salesforce.com",),
            )

    async def test_registration(self):
        registry = ConnectorRegistry()
        connector = register_salesforce_connector(
            registry, self.config, client=self.client
        )
        self.assertIs(registry.get("salesforce"), connector)


if __name__ == "__main__":
    unittest.main()
