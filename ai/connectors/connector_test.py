"""Behavioral tests for the shared ModelNow connector foundation."""

import os
import unittest
from unittest.mock import MagicMock, patch

from ai.connectors import (
    Connector,
    ConnectorConfig,
    ConnectorExecutor,
    ConnectorHTTPClient,
    ConnectorMetadata,
    ConnectorRegistry,
    ConnectorRequest,
    ConnectorResult,
    EnvironmentCredentialProvider,
    register_connector_tools,
)
from ai.connectors.exceptions import (
    ConnectorNotFoundError,
    ConnectorRequestError,
)
from ai.tool_platform.permissions.policy import PermissionContext
from ai.tool_platform.registry import ToolRegistry


class FakeConnector(Connector):
    def __init__(self):
        super().__init__(
            ConnectorMetadata(
                name="demo",
                version="1.0.0",
                description="Local test connector",
                operations=("echo",),
                operation_schemas={
                    "echo": {
                        "type": "object",
                        "properties": {
                            "message": {
                                "type": "string",
                                "minLength": 1,
                            }
                        },
                        "required": ["message"],
                        "additionalProperties": False,
                    }
                },
                required_permissions=("demo:read",),
            )
        )
        self.calls = []

    async def execute(self, request: ConnectorRequest, credentials):
        self.calls.append((request, dict(credentials)))
        return ConnectorResult(
            connector=self.metadata.name,
            operation=request.operation,
            success=True,
            data={"message": request.arguments["message"]},
        )


class ConnectorFoundationTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.registry = ConnectorRegistry()
        self.connector = FakeConnector()
        self.registry.register(self.connector)
        self.executor = ConnectorExecutor(self.registry)

        self.allowed_context = PermissionContext(
            user_id="test-user",
            permissions=frozenset({
                "connector:demo:execute",
                "demo:read",
            }),
        )

    def test_registry_register_get_list_and_unregister(self):
        self.assertIs(self.registry.get("demo"), self.connector)
        self.assertEqual(len(self.registry), 1)
        self.assertEqual(
            [item.metadata.name for item in self.registry.list_connectors()],
            ["demo"],
        )
        self.assertTrue(self.registry.unregister("demo"))
        self.assertEqual(len(self.registry), 0)
        self.assertFalse(self.registry.unregister("demo"))

    def test_registry_rejects_duplicate_connector(self):
        with self.assertRaises(ValueError):
            self.registry.register(FakeConnector())

    def test_registry_rejects_unknown_connector(self):
        with self.assertRaises(ConnectorNotFoundError):
            self.registry.get("missing")

    async def test_valid_execution_returns_connector_result(self):
        result = await self.executor.execute(
            "demo",
            "echo",
            {"message": "hello"},
            context=self.allowed_context,
        )

        self.assertTrue(result.success)
        self.assertEqual(result.data, {"message": "hello"})
        self.assertEqual(len(self.connector.calls), 1)

    async def test_invalid_arguments_do_not_call_connector(self):
        result = await self.executor.execute(
            "demo",
            "echo",
            {"message": "", "unexpected": True},
            context=self.allowed_context,
        )

        self.assertFalse(result.success)
        self.assertEqual(self.connector.calls, [])

    async def test_unknown_operation_does_not_call_connector(self):
        result = await self.executor.execute(
            "demo",
            "delete_everything",
            {},
            context=self.allowed_context,
        )

        self.assertFalse(result.success)
        self.assertEqual(self.connector.calls, [])

    async def test_missing_permission_denies_execution(self):
        context = PermissionContext(
            user_id="test-user",
            permissions=frozenset({"connector:demo:execute"}),
        )

        result = await self.executor.execute(
            "demo",
            "echo",
            {"message": "hello"},
            context=context,
        )

        self.assertFalse(result.success)
        self.assertEqual(self.connector.calls, [])

    async def test_missing_context_denies_execution(self):
        result = await self.executor.execute(
            "demo",
            "echo",
            {"message": "hello"},
        )

        self.assertFalse(result.success)
        self.assertEqual(self.connector.calls, [])

    async def test_missing_environment_credential_fails_safely(self):
        provider = EnvironmentCredentialProvider({
            "demo": {"api_token": "MODELNOW_TEST_DEMO_TOKEN"}
        })
        executor = ConnectorExecutor(self.registry, provider)

        with patch.dict(os.environ, {}, clear=True):
            result = await executor.execute(
                "demo",
                "echo",
                {"message": "hello"},
                context=self.allowed_context,
            )

        self.assertFalse(result.success)
        self.assertIn("api_token", result.error)
        self.assertNotIn("MODELNOW_TEST_DEMO_TOKEN", result.error)
        self.assertEqual(self.connector.calls, [])

    async def test_tool_platform_bridge_registers_and_executes(self):
        tool_registry = ToolRegistry()
        registered = register_connector_tools(
            tool_registry,
            self.registry,
            permission_context=self.allowed_context,
            executor=self.executor,
        )

        self.assertEqual(len(registered), 1)
        tool = tool_registry.get("connector.demo")
        result = await tool.handler(
            operation="echo",
            arguments={"message": "from tool platform"},
        )

        self.assertTrue(result["success"])
        self.assertEqual(
            result["data"],
            {"message": "from tool platform"},
        )

    def test_http_client_requires_allowlisted_https_configuration(self):
        with self.assertRaises(ValueError):
            ConnectorConfig(
                base_url="http://api.example.com",
                allowed_hosts=("api.example.com",),
            )

        with self.assertRaises(ValueError):
            ConnectorHTTPClient(
                ConnectorConfig(
                    base_url="https://api.example.com",
                )
            )

    def test_http_client_rejects_untrusted_host_without_network(self):
        client = ConnectorHTTPClient(
            ConnectorConfig(
                base_url="https://api.example.com",
                allowed_hosts=("api.example.com",),
            )
        )

        with self.assertRaises(ConnectorRequestError):
            client.request("GET", "https://untrusted.example/path")

    def test_http_client_parses_mocked_json_response(self):
        client = ConnectorHTTPClient(
            ConnectorConfig(
                base_url="https://api.example.com",
                allowed_hosts=("api.example.com",),
            )
        )

        response = MagicMock()
        response.__enter__.return_value = response
        response.read.return_value = b'{"ok": true}'

        with patch.object(client._opener, "open", return_value=response) as mocked:
            result = client.request("GET", "/v1/status")

        self.assertEqual(result, {"ok": True})
        mocked.assert_called_once()
        self.assertEqual(
            mocked.call_args.args[0].full_url,
            "https://api.example.com/v1/status",
        )


if __name__ == "__main__":
    unittest.main()
