"""Linear connector tests using a fake GraphQL client."""

import unittest

from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.linear import (
    LinearConnector,
    create_linear_config,
    register_linear_connector,
)


class FakeLinearClient:
    def __init__(self, response=None, error=None):
        self.response = response if response is not None else {"data": {}}
        self.error = error
        self.calls = []

    def execute(self, query, variables, *, token):
        self.calls.append((query, variables, token))
        if self.error:
            raise self.error
        return self.response


class LinearConnectorTests(unittest.IsolatedAsyncioTestCase):
    async def test_search_issues(self):
        client = FakeLinearClient({"data": {"issues": {"nodes": []}}})
        connector = LinearConnector(create_linear_config(), client)
        result = await connector.execute(
            ConnectorRequest("search_issues", {"query": "login bug", "limit": 10}),
            {"token": "fake-key"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1]["first"], 10)
        self.assertIn("SearchIssues", client.calls[0][0])

    async def test_get_issue(self):
        client = FakeLinearClient({"data": {"issue": {"identifier": "MN-12"}}})
        connector = LinearConnector(create_linear_config(), client)
        result = await connector.execute(
            ConnectorRequest("get_issue", {"issue_id": "MN-12"}),
            {"token": "fake-key"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], {"id": "MN-12"})

    async def test_list_projects(self):
        client = FakeLinearClient({"data": {"projects": {"nodes": []}}})
        connector = LinearConnector(create_linear_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_projects", {"limit": 5}),
            {"token": "fake-key"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], {"first": 5})

    async def test_list_teams(self):
        client = FakeLinearClient({"data": {"teams": {"nodes": []}}})
        connector = LinearConnector(create_linear_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_teams", {}),
            {"token": "fake-key"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], {"first": 20})

    async def test_invalid_issue_id_rejected(self):
        client = FakeLinearClient()
        connector = LinearConnector(create_linear_config(), client)
        result = await connector.execute(
            ConnectorRequest("get_issue", {"issue_id": "../private"}),
            {"token": "fake-key"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_invalid_limit_rejected(self):
        client = FakeLinearClient()
        connector = LinearConnector(create_linear_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_teams", {"limit": 500}),
            {"token": "fake-key"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_unknown_argument_rejected(self):
        client = FakeLinearClient()
        connector = LinearConnector(create_linear_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_teams", {"arbitrary_url": "https://evil.example"}),
            {"token": "fake-key"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_missing_api_key(self):
        client = FakeLinearClient()
        connector = LinearConnector(create_linear_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_teams", {}),
            {},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_graphql_errors_are_sanitized(self):
        client = FakeLinearClient({"errors": [{"message": "private backend detail"}]})
        connector = LinearConnector(create_linear_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_teams", {}),
            {"token": "fake-key"},
        )
        self.assertFalse(result.success)
        self.assertNotIn("private backend detail", result.error)

    async def test_transport_error_does_not_leak_key(self):
        client = FakeLinearClient(error=RuntimeError("secret-linear-key"))
        connector = LinearConnector(create_linear_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_teams", {}),
            {"token": "secret-linear-key"},
        )
        self.assertFalse(result.success)
        self.assertNotIn("secret-linear-key", result.error)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_linear_connector(
            registry, client=FakeLinearClient()
        )
        self.assertIs(registry.get("linear"), connector)

    async def test_only_linear_endpoint_is_allowed(self):
        config = create_linear_config()
        self.assertEqual(
            config.transport.allowed_hosts,
            ("api.linear.app",),
        )
        self.assertEqual(
            config.transport.base_url,
            "https://api.linear.app",
        )


if __name__ == "__main__":
    unittest.main()
