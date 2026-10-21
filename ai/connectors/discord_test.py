import unittest

from ai.connectors.discord import (
    DISCORD_API_BASE_URL,
    DiscordConnector,
    DiscordConnectorConfig,
    register_discord_connector,
)
from ai.connectors.discord.schemas import validate_discord_arguments
from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry


class FakeDiscordClient:
    def __init__(self, response=None, error=None):
        self.response = response if response is not None else {"ok": True}
        self.error = error
        self.calls = []

    def request(self, method, path, *, query=None, json_body=None, token=None):
        self.calls.append({
            "method": method,
            "path": path,
            "query": query,
            "json_body": json_body,
            "token": token,
        })
        if self.error:
            raise self.error
        return self.response


class DiscordConnectorTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = DiscordConnectorConfig()
        self.client = FakeDiscordClient()
        self.connector = DiscordConnector(self.config, self.client)
        self.credentials = {"bot_token": "test-token"}

    async def test_reads_current_bot(self):
        result = await self.connector.execute(
            ConnectorRequest("get_current_bot", {}), self.credentials
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["method"], "GET")
        self.assertEqual(self.client.calls[0]["path"], "/users/@me")
        self.assertEqual(self.client.calls[0]["token"], "test-token")

    async def test_lists_guilds_with_limit(self):
        result = await self.connector.execute(
            ConnectorRequest("list_guilds", {"limit": 25}), self.credentials
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["query"], {"limit": 25})

    async def test_validates_guild_id_and_uses_fixed_path(self):
        result = await self.connector.execute(
            ConnectorRequest("get_guild", {"guild_id": "123456789"}), self.credentials
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["path"], "/guilds/123456789")

    async def test_validates_channel_id(self):
        result = await self.connector.execute(
            ConnectorRequest("get_channel", {"channel_id": "not-an-id"}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_unknown_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_everything", {}), self.credentials
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_missing_token_fails_without_request(self):
        result = await self.connector.execute(
            ConnectorRequest("get_current_bot", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_http_error_does_not_leak_token(self):
        client = FakeDiscordClient(error=RuntimeError("token=test-token"))
        connector = DiscordConnector(self.config, client)
        result = await connector.execute(
            ConnectorRequest("get_current_bot", {}), self.credentials
        )
        self.assertFalse(result.success)
        self.assertNotIn("test-token", result.error)

    async def test_sending_disabled_by_default(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "send_message",
                {"channel_id": "123456789", "content": "hello"},
            ),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_send_message_when_explicitly_enabled(self):
        config = DiscordConnectorConfig(
            enable_message_sending=True,
            required_permissions=("discord:read", "discord:messages:send"),
        )
        client = FakeDiscordClient({"id": "message-id"})
        connector = DiscordConnector(config, client)
        result = await connector.execute(
            ConnectorRequest(
                "send_message",
                {"channel_id": "123456789", "content": "hello"},
            ),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0]["method"], "POST")
        self.assertEqual(
            client.calls[0]["path"], "/channels/123456789/messages"
        )
        self.assertEqual(client.calls[0]["json_body"], {"content": "hello"})

    async def test_send_message_requires_permission_configuration(self):
        with self.assertRaises(ValueError):
            DiscordConnectorConfig(
                enable_message_sending=True,
                required_permissions=("discord:read",),
            )

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_discord_connector(registry, self.config, self.client)
        self.assertIs(registry.get("discord"), connector)

    async def test_base_url_is_fixed(self):
        self.assertEqual(
            self.config.transport.base_url, DISCORD_API_BASE_URL
        )
        self.assertEqual(
            tuple(self.config.transport.allowed_hosts), ("discord.com",)
        )


if __name__ == "__main__":
    unittest.main()
