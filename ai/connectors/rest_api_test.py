"""REST API connector tests use a fake client; no network is required."""
import unittest

from ai.connectors.exceptions import ConnectorConfigurationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.rest_api import (
    RESTAPIConnector,
    RESTAPIOperationConfig,
    create_rest_api_config,
    register_rest_api_connector,
)


class FakeRESTClient:
    def __init__(self):
        self.calls = []

    def request(self, operation, *, query=None, body=None, access_token=None):
        self.calls.append((operation.name, query, body, access_token))
        return {"ok": True}


class RESTAPITests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.operation = RESTAPIOperationConfig(
            "list_items", "GET", "/items",
            query_schema={
                "type": "object",
                "properties": {"limit": {"type": "integer", "minimum": 1, "maximum": 100}},
                "required": [],
                "additionalProperties": False,
            },
        )
        self.config = create_rest_api_config(
            "https://api.example.com",
            ("api.example.com",),
            (self.operation,),
            credential_env_var=None,
        )
        self.client = FakeRESTClient()
        self.connector = RESTAPIConnector(self.config, self.client)

    async def test_get_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("list_items", {"query": {"limit": 10}}), {}
        )
        self.assertTrue(result.success)
        self.assertEqual(result.data, {"ok": True})
        self.assertEqual(self.client.calls[-1][1], {"limit": 10})

    async def test_rejects_unconfigured_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_everything", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_unknown_arguments(self):
        result = await self.connector.execute(
            ConnectorRequest("list_items", {"url": "https://evil.example"}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_query_value(self):
        result = await self.connector.execute(
            ConnectorRequest("list_items", {"query": {"limit": 1000}}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_body_on_get(self):
        result = await self.connector.execute(
            ConnectorRequest("list_items", {"body": {"admin": True}}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_missing_token_fails_safely(self):
        config = create_rest_api_config(
            "https://api.example.com", ("api.example.com",), (self.operation,)
        )
        connector = RESTAPIConnector(config, self.client)
        result = await connector.execute(ConnectorRequest("list_items", {}), {})
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_http_base_url(self):
        with self.assertRaises(ConnectorConfigurationError):
            create_rest_api_config(
                "http://api.example.com", ("api.example.com",), (self.operation,)
            )

    async def test_rejects_unallowlisted_host(self):
        with self.assertRaises(ConnectorConfigurationError):
            create_rest_api_config(
                "https://evil.example", ("api.example.com",), (self.operation,)
            )

    async def test_write_method_requires_opt_in(self):
        operation = RESTAPIOperationConfig(
            "create_item", "POST", "/items",
            body_schema={"type": "object", "properties": {}, "additionalProperties": False},
            required_permissions=("rest_api:write",),
        )
        with self.assertRaises(ConnectorConfigurationError):
            create_rest_api_config(
                "https://api.example.com", ("api.example.com",), (operation,),
                credential_env_var=None,
            )

    async def test_write_method_requires_permission(self):
        operation = RESTAPIOperationConfig(
            "create_item", "POST", "/items",
            body_schema={"type": "object", "properties": {}, "additionalProperties": False},
        )
        with self.assertRaises(ConnectorConfigurationError):
            create_rest_api_config(
                "https://api.example.com", ("api.example.com",), (operation,),
                enable_mutations=True, credential_env_var=None,
            )

    async def test_rejects_unsafe_path(self):
        operation = RESTAPIOperationConfig("bad", "GET", "/../admin")
        with self.assertRaises(ConnectorConfigurationError):
            create_rest_api_config(
                "https://api.example.com", ("api.example.com",), (operation,),
                credential_env_var=None,
            )

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_rest_api_connector(
            registry, self.config, client=self.client
        )
        self.assertIs(registry.get("rest_api"), connector)


if __name__ == "__main__":
    unittest.main()
