"""Mock-based tests for the read-only SAP connector."""
import unittest

from ai.connectors.exceptions import ConnectorConfigurationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.sap import SAPConfig, SAPConnector, SAPEntityConfig, register_sap_connector


class FakeSAPClient:
    def __init__(self):
        self.calls = []

    def get(self, path, *, query=None, access_token=None):
        self.calls.append((path, query, access_token))
        return {"value": []}


class SAPTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = SAPConfig(
            service_url="https://sap.example.com/odata/v4/service/",
            allowed_hosts=("sap.example.com",),
            entities=(SAPEntityConfig("products", "Products", "ProductID"),),
        )
        self.client = FakeSAPClient()
        self.connector = SAPConnector(self.config, self.client)

    async def test_list_entities(self):
        result = await self.connector.execute(
            ConnectorRequest("list_entities", {"entity": "products", "top": 10}),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], "Products")
        self.assertEqual(self.client.calls[-1][1]["$top"], 10)

    async def test_get_entity(self):
        result = await self.connector.execute(
            ConnectorRequest("get_entity", {"entity": "products", "key": "P-100"}),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], "Products('P-100')")

    async def test_select_fields(self):
        result = await self.connector.execute(
            ConnectorRequest("list_entities", {
                "entity": "products", "select": ["ProductID", "Name"],
            }),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][1]["$select"], "ProductID,Name")

    async def test_missing_token(self):
        result = await self.connector.execute(
            ConnectorRequest("list_entities", {"entity": "products"}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_entity(self):
        result = await self.connector.execute(
            ConnectorRequest("list_entities", {"entity": "users"}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_entity", {"entity": "products"}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_page_size(self):
        result = await self.connector.execute(
            ConnectorRequest("list_entities", {"entity": "products", "top": 9999}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_select(self):
        result = await self.connector.execute(
            ConnectorRequest("list_entities", {
                "entity": "products", "select": ["Name,Secret"],
            }),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_http_service_url(self):
        with self.assertRaises(ConnectorConfigurationError):
            SAPConfig(
                service_url="http://sap.example.com/odata",
                allowed_hosts=("sap.example.com",),
                entities=(SAPEntityConfig("products", "Products"),),
            )

    async def test_rejects_unallowlisted_host(self):
        with self.assertRaises(ConnectorConfigurationError):
            SAPConfig(
                service_url="https://evil.example/odata",
                allowed_hosts=("sap.example.com",),
                entities=(SAPEntityConfig("products", "Products"),),
            )

    async def test_registration(self):
        registry = ConnectorRegistry()
        connector = register_sap_connector(registry, self.config, client=self.client)
        self.assertIs(registry.get("sap"), connector)


if __name__ == "__main__":
    unittest.main()
