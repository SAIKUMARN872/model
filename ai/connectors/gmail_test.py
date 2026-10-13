import unittest

from ai.connectors.gmail import (
    GMAIL_API_BASE_URL,
    GmailConnector,
    GmailConnectorConfig,
    register_gmail_connector,
)
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry


class FakeGmailClient:
    def __init__(self, response=None, error=None):
        self.response = response if response is not None else {"ok": True}
        self.error = error
        self.calls = []

    def request(self, path, *, access_token, query=None):
        self.calls.append({
            "path": path,
            "access_token": access_token,
            "query": query,
        })
        if self.error:
            raise self.error
        return self.response


class GmailConnectorTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = GmailConnectorConfig()
        self.client = FakeGmailClient()
        self.connector = GmailConnector(self.config, self.client)
        self.credentials = {"access_token": "fake-google-access-token"}

    async def test_get_profile(self):
        result = await self.connector.execute(
            ConnectorRequest("get_profile", {}), self.credentials
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["path"], "/profile")

    async def test_list_labels(self):
        result = await self.connector.execute(
            ConnectorRequest("list_labels", {}), self.credentials
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["path"], "/labels")

    async def test_list_messages_query(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "list_messages",
                {"maxResults": 10, "q": "is:unread", "includeSpamTrash": False},
            ),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["path"], "/messages")
        self.assertEqual(
            self.client.calls[0]["query"],
            {"maxResults": 10, "q": "is:unread", "includeSpamTrash": False},
        )

    async def test_get_message(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "get_message", {"message_id": "abc_123", "format": "metadata"}
            ),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["path"], "/messages/abc_123")
        self.assertEqual(self.client.calls[0]["query"], {"format": "metadata"})

    async def test_missing_token_fails_without_request(self):
        result = await self.connector.execute(
            ConnectorRequest("get_profile", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation_is_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("send_message", {}), self.credentials
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_message_id(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "get_message", {"message_id": "../other"}
            ),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_max_results(self):
        result = await self.connector.execute(
            ConnectorRequest("list_messages", {"maxResults": 500}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_boolean(self):
        result = await self.connector.execute(
            ConnectorRequest("list_messages", {"includeSpamTrash": "false"}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_transport_error_does_not_leak_token(self):
        client = FakeGmailClient(error=RuntimeError("fake-google-access-token"))
        connector = GmailConnector(self.config, client)
        result = await connector.execute(
            ConnectorRequest("get_profile", {}), self.credentials
        )
        self.assertFalse(result.success)
        self.assertNotIn("fake-google-access-token", result.error)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_gmail_connector(registry, self.config, self.client)
        self.assertIs(registry.get("gmail"), connector)

    async def test_api_host_is_fixed(self):
        self.assertEqual(self.config.transport.base_url, GMAIL_API_BASE_URL)
        self.assertEqual(
            tuple(self.config.transport.allowed_hosts),
            ("gmail.googleapis.com",),
        )


if __name__ == "__main__":
    unittest.main()
