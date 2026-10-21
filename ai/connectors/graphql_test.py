"""Tests for the allowlisted GraphQL connector."""
import unittest

from ai.connectors.exceptions import ConnectorConfigurationError
from ai.connectors.graphql import (
    GraphQLConfig, GraphQLOperationConfig, GraphQLConnector,
    register_graphql_connector,
)
from ai.connectors.models import ConnectorRequest


def config(*, mutation=False, enable_mutations=False):
    ops = (
        GraphQLOperationConfig(
            name="viewer",
            query="query Viewer { viewer { id name } }",
            variable_schema={
                "type": "object", "properties": {},
                "additionalProperties": False,
            },
        ),
    )
    if mutation:
        ops += (GraphQLOperationConfig(
            name="updateName",
            query="mutation UpdateName($name: String!) { updateName(name: $name) { id } }",
            operation_type="mutation",
            variable_schema={
                "type": "object",
                "properties": {"name": {"type": "string", "minLength": 1}},
                "required": ["name"],
                "additionalProperties": False,
            },
        ),)
    return GraphQLConfig(
        endpoint_url="https://api.example.com/graphql",
        allowed_hosts=("api.example.com",),
        operations=ops,
        enable_mutations=enable_mutations,
    )


class FakeClient:
    def __init__(self, result=None, error=None):
        self.result = result or {"data": {"viewer": {"id": "1"}}}
        self.error = error
        self.calls = []

    def execute(self, query, variables, *, access_token=None):
        self.calls.append((query, variables, access_token))
        if self.error:
            raise self.error
        return self.result


class FakeRegistry:
    def __init__(self):
        self.items = []

    def register(self, connector):
        self.items.append(connector)


class GraphQLConnectorTests(unittest.IsolatedAsyncioTestCase):
    async def test_executes_allowlisted_query(self):
        client = FakeClient()
        connector = GraphQLConnector(config(), client)
        result = await connector.execute(ConnectorRequest("viewer", {}), {"access_token": "token"})
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][0], "query Viewer { viewer { id name } }")

    async def test_unknown_operation_is_rejected(self):
        client = FakeClient()
        connector = GraphQLConnector(config(), client)
        result = await connector.execute(ConnectorRequest("arbitrary", {}), {"access_token": "token"})
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_missing_token_is_rejected(self):
        client = FakeClient()
        connector = GraphQLConnector(config(), client)
        result = await connector.execute(ConnectorRequest("viewer", {}), {})
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_unknown_variables_are_rejected(self):
        client = FakeClient()
        connector = GraphQLConnector(config(), client)
        result = await connector.execute(
            ConnectorRequest("viewer", {"variables": {"unexpected": "x"}}),
            {"access_token": "token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_mutation_disabled_by_default(self):
        client = FakeClient()
        connector = GraphQLConnector(config(mutation=True), client)
        result = await connector.execute(
            ConnectorRequest("updateName", {"variables": {"name": "New"}}),
            {"access_token": "token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_mutation_runs_when_explicitly_enabled(self):
        client = FakeClient()
        connector = GraphQLConnector(config(mutation=True, enable_mutations=True), client)
        result = await connector.execute(
            ConnectorRequest("updateName", {"variables": {"name": "New"}}),
            {"access_token": "token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], {"name": "New"})

    async def test_invalid_variable_type_is_rejected(self):
        client = FakeClient()
        connector = GraphQLConnector(config(mutation=True), client)
        result = await connector.execute(
            ConnectorRequest("updateName", {"variables": {"name": 123}}),
            {"access_token": "token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_transport_error_does_not_leak_secret(self):
        client = FakeClient(error=RuntimeError("token=secret-value"))
        connector = GraphQLConnector(config(), client)
        result = await connector.execute(ConnectorRequest("viewer", {}), {"access_token": "secret-value"})
        self.assertFalse(result.success)
        self.assertNotIn("secret-value", result.error)

    async def test_registration_helper(self):
        registry = FakeRegistry()
        connector = register_graphql_connector(registry, config(), client=FakeClient())
        self.assertIs(registry.items[0], connector)

    def test_rejects_untrusted_endpoint(self):
        with self.assertRaises(ConnectorConfigurationError):
            GraphQLConfig(
                endpoint_url="https://evil.example/graphql",
                allowed_hosts=("api.example.com",),
                operations=(),
            )

    def test_rejects_http_endpoint(self):
        with self.assertRaises(ConnectorConfigurationError):
            GraphQLConfig(
                endpoint_url="http://api.example.com/graphql",
                allowed_hosts=("api.example.com",),
                operations=(),
            )


if __name__ == "__main__":
    unittest.main()



