"""Microsoft Teams connector tests using a fake Graph client."""

import unittest

from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.microsoft_teams import (
    MicrosoftTeamsConnector,
    create_microsoft_teams_config,
    register_microsoft_teams_connector,
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


class MicrosoftTeamsTests(unittest.IsolatedAsyncioTestCase):
    async def test_list_joined_teams(self):
        client = FakeGraphClient()
        connector = MicrosoftTeamsConnector(create_microsoft_teams_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_joined_teams", {"top": 10}),
            {"token": "fake-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], "/v1.0/me/joinedTeams")
        self.assertEqual(client.calls[0][3], {"$top": 10})

    async def test_list_channels(self):
        client = FakeGraphClient()
        connector = MicrosoftTeamsConnector(create_microsoft_teams_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_channels", {"team_id": "team-123"}),
            {"token": "fake-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(
            client.calls[0][1],
            "/v1.0/teams/team-123/channels",
        )

    async def test_get_channel(self):
        client = FakeGraphClient({"id": "channel-1"})
        connector = MicrosoftTeamsConnector(create_microsoft_teams_config(), client)
        result = await connector.execute(
            ConnectorRequest("get_channel", {
                "team_id": "team-1",
                "channel_id": "channel-1",
            }),
            {"token": "fake-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(
            client.calls[0][1],
            "/v1.0/teams/team-1/channels/channel-1",
        )

    async def test_list_channel_messages(self):
        client = FakeGraphClient()
        connector = MicrosoftTeamsConnector(create_microsoft_teams_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_channel_messages", {
                "team_id": "team-1",
                "channel_id": "channel-1",
                "top": 5,
            }),
            {"token": "fake-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(
            client.calls[0][1],
            "/v1.0/teams/team-1/channels/channel-1/messages",
        )
        self.assertEqual(client.calls[0][3], {"$top": 5})

    async def test_invalid_team_id_rejected(self):
        client = FakeGraphClient()
        connector = MicrosoftTeamsConnector(create_microsoft_teams_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_channels", {"team_id": "../private"}),
            {"token": "fake-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_invalid_top_rejected(self):
        client = FakeGraphClient()
        connector = MicrosoftTeamsConnector(create_microsoft_teams_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_joined_teams", {"top": 500}),
            {"token": "fake-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_missing_token(self):
        client = FakeGraphClient()
        connector = MicrosoftTeamsConnector(create_microsoft_teams_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_joined_teams", {}),
            {},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_unknown_operation_rejected(self):
        client = FakeGraphClient()
        connector = MicrosoftTeamsConnector(create_microsoft_teams_config(), client)
        result = await connector.execute(
            ConnectorRequest("send_message", {}),
            {"token": "fake-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_transport_error_does_not_leak_token(self):
        client = FakeGraphClient(error=RuntimeError("secret-token"))
        connector = MicrosoftTeamsConnector(create_microsoft_teams_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_joined_teams", {}),
            {"token": "secret-token"},
        )
        self.assertFalse(result.success)
        self.assertNotIn("secret-token", result.error)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_microsoft_teams_connector(
            registry, client=FakeGraphClient()
        )
        self.assertIs(registry.get("microsoft_teams"), connector)

    async def test_graph_host_is_fixed(self):
        config = create_microsoft_teams_config()
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
