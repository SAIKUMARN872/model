"""Tests for the generic Zoho connector."""
import unittest

from ai.connectors.config import ConnectorConfig
from ai.connectors.exceptions import (
    ConnectorAuthenticationError,
    ConnectorConfigurationError,
    ConnectorRequestError,
    ConnectorValidationError,
)
from ai.connectors.models import ConnectorRequest
from ai.connectors.zoho import ZohoConfig, ZohoOperation, ZohoConnector
from ai.connectors.zoho.client import ZohoClient
from ai.connectors.zoho.schemas import validate_zoho_arguments


class FakeHTTP:
    def __init__(self, result=None):
        self.result = result if result is not None else {"data": []}
        self.calls = []

    def request(self, method, path, **kwargs):
        self.calls.append((method, path, kwargs))
        return self.result


class ZohoTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.operation = ZohoOperation(
            "list_items", "/inventory/v1/items", ("page", "per_page")
        )
        self.config = ZohoConfig(
            operations=(self.operation,),
            allowed_hosts=("www.zohoapis.com",),
        )
        self.http = FakeHTTP()
        self.client = ZohoClient(self.config, http_client=self.http)
        self.connector = ZohoConnector(self.config, client=self.client)

    def test_metadata_uses_generic_name(self):
        self.assertEqual(self.connector.metadata.name, "zoho")
        self.assertEqual(self.connector.metadata.operations, ("list_items",))

    async def test_get_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("list_items", {"page": 1}),
            {"token": "test-token"},
        )
        self.assertTrue(result.success)
        method, path, kwargs = self.http.calls[0]
        self.assertEqual(method, "GET")
        self.assertEqual(path, "inventory/v1/items")
        self.assertEqual(kwargs["query"], {"page": 1})
        self.assertEqual(
            kwargs["headers"]["Authorization"], "Zoho-oauthtoken test-token"
        )

    async def test_missing_token_fails(self):
        result = await self.connector.execute(
            ConnectorRequest("list_items"), {}
        )
        self.assertFalse(result.success)
        self.assertIn("missing", result.error)

    async def test_unconfigured_operation_fails(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_items"), {"token": "test"}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.http.calls, [])

    async def test_unknown_query_parameter_fails(self):
        result = await self.connector.execute(
            ConnectorRequest("list_items", {"url": "https://evil.example"}),
            {"token": "test"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.http.calls, [])

    def test_invalid_query_values(self):
        with self.assertRaises(ConnectorValidationError):
            validate_zoho_arguments(self.operation, {"page": {"x": 1}})

    def test_client_requires_token(self):
        with self.assertRaises(ConnectorAuthenticationError):
            self.client.request("/inventory/v1/items", token="")

    def test_application_error_is_sanitized(self):
        http = FakeHTTP({"code": "INVALID_TOKEN", "message": "private details"})
        client = ZohoClient(self.config, http_client=http)
        with self.assertRaisesRegex(ConnectorRequestError, "INVALID_TOKEN"):
            client.request("/inventory/v1/items", token="test")
    
    def test_rejects_unallowlisted_base_host(self):
        with self.assertRaises(ConnectorConfigurationError):
            ZohoConfig(
                base_url="https://attacker.example",
                allowed_hosts=("www.zohoapis.com",),
            )

    def test_rejects_http_base_url(self):
        with self.assertRaises(ConnectorConfigurationError):
            ZohoConfig(
                base_url="http://www.zohoapis.com",
                allowed_hosts=("www.zohoapis.com",),
            )

    def test_rejects_path_traversal(self):
        with self.assertRaises(ConnectorConfigurationError):
            ZohoConfig(operations=(
                ZohoOperation("unsafe", "/inventory/../private"),
            ))

    def test_rejects_duplicate_operations(self):
        with self.assertRaises(ConnectorConfigurationError):
            ZohoConfig(operations=(
                self.operation, self.operation,
            ))

    def test_only_configured_query_keys_allowed(self):
        with self.assertRaises(ConnectorValidationError):
            validate_zoho_arguments(self.operation, {"criteria": "x"})

    def test_custom_regional_domain(self):
        config = ZohoConfig(
            base_url="https://www.zohoapis.in",
            allowed_hosts=("www.zohoapis.in",),
        )
        self.assertEqual(config.base_url, "https://www.zohoapis.in")


if __name__ == "__main__":
    unittest.main()
