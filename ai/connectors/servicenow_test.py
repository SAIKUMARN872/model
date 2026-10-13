"""Mock-based tests for the read-only ServiceNow connector."""
import unittest

from ai.connectors.exceptions import ConnectorConfigurationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.servicenow import (
    ServiceNowConfig,
    ServiceNowConnector,
    ServiceNowTableConfig,
    register_servicenow_connector,
)


class FakeServiceNowClient:
    def __init__(self):
        self.calls = []

    def get(self, path, *, query=None, access_token=None):
        self.calls.append((path, query, access_token))
        return {"result": []}


class ServiceNowTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = ServiceNowConfig(
            instance_url="https://example.service-now.com",
            allowed_hosts=("example.service-now.com",),
            tables=(ServiceNowTableConfig("incidents", "incident"),),
        )
        self.client = FakeServiceNowClient()
        self.connector = ServiceNowConnector(self.config, self.client)

    async def test_list_records(self):
        result = await self.connector.execute(
            ConnectorRequest("list_records", {
                "table": "incidents", "limit": 10, "fields": ["number", "short_description"],
            }),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], "table/incident")
        self.assertEqual(self.client.calls[-1][1]["sysparm_limit"], 10)

    async def test_get_record(self):
        sys_id = "a" * 32
        result = await self.connector.execute(
            ConnectorRequest("get_record", {"table": "incidents", "sys_id": sys_id}),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], f"table/incident/{sys_id}")

    async def test_missing_token(self):
        result = await self.connector.execute(
            ConnectorRequest("list_records", {"table": "incidents"}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unconfigured_table(self):
        result = await self.connector.execute(
            ConnectorRequest("list_records", {"table": "users"}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_sys_id(self):
        result = await self.connector.execute(
            ConnectorRequest("get_record", {"table": "incidents", "sys_id": "../admin"}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_limit(self):
        result = await self.connector.execute(
            ConnectorRequest("list_records", {"table": "incidents", "limit": 10000}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_fields(self):
        result = await self.connector.execute(
            ConnectorRequest("list_records", {
                "table": "incidents", "fields": ["number,sys_id"],
            }),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_filter(self):
        result = await self.connector.execute(
            ConnectorRequest("list_records", {
                "table": "incidents", "sysparm_query": "active=true;DROP TABLE",
            }),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_record", {"table": "incidents"}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_http_url(self):
        with self.assertRaises(ConnectorConfigurationError):
            ServiceNowConfig(
                instance_url="http://example.service-now.com",
                allowed_hosts=("example.service-now.com",),
                tables=(ServiceNowTableConfig("incidents", "incident"),),
            )

    async def test_rejects_unallowlisted_host(self):
        with self.assertRaises(ConnectorConfigurationError):
            ServiceNowConfig(
                instance_url="https://evil.example",
                allowed_hosts=("example.service-now.com",),
                tables=(ServiceNowTableConfig("incidents", "incident"),),
            )

    async def test_registration(self):
        registry = ConnectorRegistry()
        connector = register_servicenow_connector(
            registry, self.config, client=self.client
        )
        self.assertIs(registry.get("servicenow"), connector)


if __name__ == "__main__":
    unittest.main()
