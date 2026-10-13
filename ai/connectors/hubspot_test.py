"""HubSpot connector tests using a fake API client."""

import unittest

from ai.connectors.exceptions import ConnectorConfigurationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.hubspot import (
    HUBSPOT_API_BASE_URL,
    HubSpotConnector,
    HubSpotConnectorConfig,
    register_hubspot_connector,
)


class FakeClient:
    def __init__(self, response=None, error=None):
        self.response = response if response is not None else {"results": []}
        self.error = error
        self.calls = []

    def request(self, method, path, *, token, query=None, json_body=None):
        self.calls.append((method, path, token, query, json_body))
        if self.error:
            raise self.error
        return self.response


class HubSpotConnectorTests(unittest.IsolatedAsyncioTestCase):
    async def test_lists_contacts_with_pagination(self):
        client = FakeClient({"results": [{"id": "123"}]})
        connector = HubSpotConnector(HubSpotConnectorConfig(), client)
        result = await connector.execute(
            ConnectorRequest("list_contacts", {"limit": 10, "after": "abc"}),
            {"token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][0], "GET")
        self.assertEqual(client.calls[0][1], "/crm/v3/objects/contacts")
        self.assertEqual(client.calls[0][3], {"limit": 10, "after": "abc"})

    async def test_search_contacts_posts_query(self):
        client = FakeClient({"results": []})
        connector = HubSpotConnector(HubSpotConnectorConfig(), client)
        result = await connector.execute(
            ConnectorRequest("search_contacts", {"query": "modelnow", "limit": 5}),
            {"token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][0], "POST")
        self.assertEqual(client.calls[0][4], {"query": "modelnow", "limit": 5})

    async def test_get_contact_uses_validated_id(self):
        client = FakeClient({"id": "123"})
        connector = HubSpotConnector(HubSpotConnectorConfig(), client)
        result = await connector.execute(
            ConnectorRequest("get_contact", {"contact_id": "123"}),
            {"token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], "/crm/v3/objects/contacts/123")

    async def test_invalid_id_does_not_call_client(self):
        client = FakeClient()
        connector = HubSpotConnector(HubSpotConnectorConfig(), client)
        result = await connector.execute(
            ConnectorRequest("get_contact", {"contact_id": "../private"}),
            {"token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_invalid_limit_does_not_call_client(self):
        client = FakeClient()
        connector = HubSpotConnector(HubSpotConnectorConfig(), client)
        result = await connector.execute(
            ConnectorRequest("list_contacts", {"limit": 1000}),
            {"token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_invalid_property_name_is_rejected(self):
        client = FakeClient()
        connector = HubSpotConnector(HubSpotConnectorConfig(), client)
        result = await connector.execute(
            ConnectorRequest("list_contacts", {"properties": ["email&admin=true"]}),
            {"token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_missing_token_is_rejected(self):
        client = FakeClient()
        connector = HubSpotConnector(HubSpotConnectorConfig(), client)
        result = await connector.execute(
            ConnectorRequest("list_contacts", {}),
            {},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_unknown_operation_is_rejected(self):
        client = FakeClient()
        connector = HubSpotConnector(HubSpotConnectorConfig(), client)
        result = await connector.execute(
            ConnectorRequest("delete_contact", {"contact_id": "123"}),
            {"token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_transport_error_does_not_leak_token(self):
        client = FakeClient(error=RuntimeError("secret-token-value"))
        connector = HubSpotConnector(HubSpotConnectorConfig(), client)
        result = await connector.execute(
            ConnectorRequest("list_contacts", {}),
            {"token": "secret-token-value"},
        )
        self.assertFalse(result.success)
        self.assertNotIn("secret-token-value", result.error)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        client = FakeClient()
        connector = register_hubspot_connector(registry, client=client)
        self.assertIs(registry.get("hubspot"), connector)

    async def test_configuration_rejects_untrusted_host(self):
        from ai.connectors.config import ConnectorConfig

        with self.assertRaises((ValueError, ConnectorConfigurationError)):
            HubSpotConnectorConfig(
                transport=ConnectorConfig(
                    base_url="https://evil.example",
                    allowed_hosts=("evil.example",),
                    credential_env_vars={"token": "HUBSPOT_ACCESS_TOKEN"},
                )
            )

    async def test_official_api_host_is_fixed(self):
        self.assertEqual(HUBSPOT_API_BASE_URL, "https://api.hubapi.com")
        config = HubSpotConnectorConfig()
        self.assertEqual(config.transport.allowed_hosts, ("api.hubapi.com",))


if __name__ == "__main__":
    unittest.main()
