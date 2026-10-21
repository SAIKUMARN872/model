"""Mock-based tests for the read-only Slack connector."""
import unittest

from ai.connectors.exceptions import ConnectorConfigurationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.slack import SlackConfig, SlackConnector, register_slack_connector


class FakeSlackClient:
    def __init__(self):
        self.calls = []

    def call(self, method, *, query=None, access_token=None):
        self.calls.append((method, query, access_token))
        return {"ok": True, "result": {}}


class SlackTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = SlackConfig()
        self.client = FakeSlackClient()
        self.connector = SlackConnector(self.config, self.client)

    async def test_workspace_info(self):
        result = await self.connector.execute(
            ConnectorRequest("get_workspace_info", {}), {"access_token": "fake"}
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], "team.info")

    async def test_list_channels(self):
        result = await self.connector.execute(
            ConnectorRequest("list_channels", {"limit": 20, "types": "public_channel"}),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], "conversations.list")
        self.assertEqual(self.client.calls[-1][1]["limit"], 20)

    async def test_channel_history(self):
        result = await self.connector.execute(
            ConnectorRequest("get_channel_history", {"channel": "C123456", "limit": 10}),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], "conversations.history")

    async def test_search_messages(self):
        result = await self.connector.execute(
            ConnectorRequest("search_messages", {"query": "deployment", "count": 10}),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], "search.messages")

    async def test_missing_token(self):
        result = await self.connector.execute(
            ConnectorRequest("list_channels", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_channel(self):
        result = await self.connector.execute(
            ConnectorRequest("get_channel_history", {"channel": "../../admin"}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unbounded_limit(self):
        result = await self.connector.execute(
            ConnectorRequest("list_channels", {"limit": 9999}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_channel_types(self):
        result = await self.connector.execute(
            ConnectorRequest("list_channels", {"types": "public_channel,admin"}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_search(self):
        result = await self.connector.execute(
            ConnectorRequest("search_messages", {"query": " "}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("chat.postMessage", {"channel": "C123456"}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_registration(self):
        registry = ConnectorRegistry()
        connector = register_slack_connector(registry, self.config, client=self.client)
        self.assertIs(registry.get("slack"), connector)

    async def test_invalid_config(self):
        with self.assertRaises(ConnectorConfigurationError):
            SlackConfig(timeout_seconds=0)

if __name__ == "__main__":
    unittest.main()
