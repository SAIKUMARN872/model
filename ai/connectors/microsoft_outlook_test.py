"""Microsoft Outlook connector tests using a fake Graph client."""

import unittest

from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.microsoft_outlook import (
    MicrosoftOutlookConnector,
    create_microsoft_outlook_config,
    register_microsoft_outlook_connector,
)


class FakeGraphClient:
    def __init__(self, response=None, error=None):
        self.response = response if response is not None else {"value": []}
        self.error = error
        self.calls = []

    def request(self, method, path, *, token, query=None):
        self.calls.append((method, path, token, query))
        if self.error:
            raise self.error
        return self.response


class MicrosoftOutlookTests(unittest.IsolatedAsyncioTestCase):
    async def test_list_messages(self):
        client = FakeGraphClient()
        connector = MicrosoftOutlookConnector(create_microsoft_outlook_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_messages", {"top": 10}),
            {"token": "fake-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], "/v1.0/me/messages")
        self.assertEqual(client.calls[0][3]["$top"], 10)

    async def test_search_messages(self):
        client = FakeGraphClient()
        connector = MicrosoftOutlookConnector(create_microsoft_outlook_config(), client)
        result = await connector.execute(
            ConnectorRequest("search_messages", {"search": "invoice"}),
            {"token": "fake-token"},
        )
        self.assertTrue(result.success)
        self.assertIn("$search", client.calls[0][3])

    async def test_get_message(self):
        client = FakeGraphClient({"id": "abc"})
        connector = MicrosoftOutlookConnector(create_microsoft_outlook_config(), client)
        result = await connector.execute(
            ConnectorRequest("get_message", {"message_id": "abc"}),
            {"token": "fake-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], "/v1.0/me/messages/abc")

    async def test_message_id_is_encoded(self):
        client = FakeGraphClient()
        connector = MicrosoftOutlookConnector(create_microsoft_outlook_config(), client)
        result = await connector.execute(
            ConnectorRequest("get_message", {"message_id": "abc/../../x"}),
            {"token": "fake-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], "/v1.0/me/messages/abc%2F..%2F..%2Fx")

    async def test_list_calendar_events(self):
        client = FakeGraphClient()
        connector = MicrosoftOutlookConnector(create_microsoft_outlook_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_calendar_events", {
                "top": 5,
                "start_datetime": "2026-10-01T00:00:00Z",
                "end_datetime": "2026-10-31T00:00:00Z",
            }),
            {"token": "fake-token"},
        )
        self.assertTrue(result.success)
        self.assertIn("$filter", client.calls[0][3])

    async def test_invalid_top_is_rejected(self):
        client = FakeGraphClient()
        connector = MicrosoftOutlookConnector(create_microsoft_outlook_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_messages", {"top": 500}),
            {"token": "fake-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_invalid_message_id_is_rejected(self):
        client = FakeGraphClient()
        connector = MicrosoftOutlookConnector(create_microsoft_outlook_config(), client)
        result = await connector.execute(
            ConnectorRequest("get_message", {"message_id": "bad\nid"}),
            {"token": "fake-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_missing_token_is_rejected(self):
        client = FakeGraphClient()
        connector = MicrosoftOutlookConnector(create_microsoft_outlook_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_messages", {}),
            {},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_unknown_operation_is_rejected(self):
        client = FakeGraphClient()
        connector = MicrosoftOutlookConnector(create_microsoft_outlook_config(), client)
        result = await connector.execute(
            ConnectorRequest("send_message", {}),
            {"token": "fake-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_transport_error_does_not_leak_token(self):
        client = FakeGraphClient(error=RuntimeError("secret-token"))
        connector = MicrosoftOutlookConnector(create_microsoft_outlook_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_messages", {}),
            {"token": "secret-token"},
        )
        self.assertFalse(result.success)
        self.assertNotIn("secret-token", result.error)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_microsoft_outlook_connector(
            registry, client=FakeGraphClient()
        )
        self.assertIs(registry.get("microsoft_outlook"), connector)

    async def test_graph_host_is_fixed(self):
        config = create_microsoft_outlook_config()
        self.assertEqual(
            config.transport.allowed_hosts,
            ("graph.microsoft.com",),
        )
        self.assertEqual(
            config.transport.base_url,
            "https://graph.microsoft.com",
        )


if __name__ == "__main__":
    unittest.main()
