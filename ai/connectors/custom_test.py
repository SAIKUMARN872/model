"""Tests for ModelNow's custom API connector."""

import unittest
from unittest.mock import Mock

from ai.connectors.config import ConnectorConfig
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.custom import (
    CustomConnector,
    CustomConnectorConfig,
    CustomOperation,
    register_custom_connector,
)


def make_config(**kwargs):
    transport = ConnectorConfig(
        base_url="https://api.example.com/v1",
        allowed_hosts=("api.example.com",),
    )
    defaults = {
        "name": "custom_example",
        "transport": transport,
        "operations": (
            CustomOperation(
                name="list_items",
                method="GET",
                path="/items",
                schema={
                    "type": "object",
                    "properties": {
                        "limit": {"type": "integer"},
                    },
                    "required": [],
                    "additionalProperties": False,
                },
            ),
            CustomOperation(
                name="create_item",
                method="POST",
                path="/items",
                schema={
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                    },
                    "required": ["title"],
                    "additionalProperties": False,
                },
            ),
        ),
    }
    defaults.update(kwargs)
    return CustomConnectorConfig(**defaults)


class CustomConnectorTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.client = Mock()
        self.client.request.return_value = {"ok": True}
        self.config = make_config()
        self.connector = CustomConnector(self.config, client=self.client)

    async def test_get_uses_configured_path_and_query(self):
        result = await self.connector.execute(
            ConnectorRequest("list_items", {"limit": 5}),
            {"api_key": "test-secret"},
        )
        self.assertTrue(result.success)
        self.client.request.assert_called_once_with(
            "GET", "/items", query={"limit": 5},
            json_body=None, headers={"Authorization": "Bearer test-secret"},
        )

    async def test_post_uses_json_body(self):
        result = await self.connector.execute(
            ConnectorRequest("create_item", {"title": "example"}),
            {"api_key": "test-secret"},
        )
        self.assertTrue(result.success)
        self.client.request.assert_called_once_with(
            "POST", "/items", query=None,
            json_body={"title": "example"},
            headers={"Authorization": "Bearer test-secret"},
        )

    async def test_missing_credentials_fails_without_request(self):
        result = await self.connector.execute(
            ConnectorRequest("list_items", {}),
            {},
        )
        self.assertFalse(result.success)
        self.client.request.assert_not_called()

    async def test_invalid_arguments_do_not_call_http_client(self):
        result = await self.connector.execute(
            ConnectorRequest("create_item", {"unexpected": "value"}),
            {"api_key": "test-secret"},
        )
        self.assertFalse(result.success)
        self.client.request.assert_not_called()

    async def test_unknown_operation_does_not_call_http_client(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_everything", {}),
            {"api_key": "test-secret"},
        )
        self.assertFalse(result.success)
        self.client.request.assert_not_called()

    async def test_secret_is_not_returned_in_authentication_error(self):
        result = await self.connector.execute(
            ConnectorRequest("list_items", {}),
            {"api_key": ""},
        )
        self.assertFalse(result.success)
        self.assertNotIn("test-secret", result.error or "")

    def test_rejects_absolute_or_traversal_paths(self):
        for path in (
            "https://evil.example/items",
            "//evil.example/items",
            "/../admin",
            "/%2e%2e/admin",
            "/items?next=https://evil.example",
            r"/items\..\admin",
        ):
            with self.subTest(path=path):
                with self.assertRaises(ValueError):
                    CustomOperation("bad_path", "GET", path)

    def test_rejects_unsupported_methods(self):
        with self.assertRaises(ValueError):
            CustomOperation("run", "TRACE", "/items")

    def test_requires_explicit_host_allowlist(self):
        config = ConnectorConfig(
            base_url="https://api.example.com/v1",
            allowed_hosts=(),
        )
        with self.assertRaises(ValueError):
            CustomConnectorConfig(
                name="custom_example",
                transport=config,
                operations=(CustomOperation("list_items", "GET", "/items"),),
            )

    def test_registry_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_custom_connector(registry, self.config, client=self.client)
        self.assertIs(registry.get("custom_example"), connector)


if __name__ == "__main__":
    unittest.main()
