"""Tests for the MCP client and session lifecycle."""

import unittest

from ai.mcp.client import MCPClient, find_tool
from ai.mcp.engine import MCPEngine
from ai.tool_platform.registry import ToolRegistry, ToolSpec


def echo_tool(**arguments):
    return {"echo": arguments.get("value", "")}


class MCPClientTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        registry = ToolRegistry()
        registry.register(ToolSpec(
            name="echo",
            description="Echo a value.",
            handler=echo_tool,
            input_schema={
                "type": "object",
                "properties": {"value": {"type": "string"}},
                "required": ["value"],
                "additionalProperties": False,
            },
        ))
        self.engine = MCPEngine(registry)
        self.client = MCPClient(
            self.engine,
            client_name="MCP Test Client",
            client_version="1.2.3",
        )

    async def asyncTearDown(self):
        await self.client.close()

    async def test_connect_initializes_session(self):
        result = await self.client.connect()
        self.assertIn("protocolVersion", result)
        self.assertTrue(self.client.session.initialized)
        self.assertIsNotNone(self.client.session.server_info)

    async def test_repeated_connect_does_not_reinitialize(self):
        first = await self.client.connect()
        second = await self.client.connect()
        self.assertEqual(first, second)

    async def test_list_tools(self):
        tools = await self.client.list_tools()
        self.assertTrue(any(tool["name"] == "echo" for tool in tools))
        self.assertEqual(find_tool(tools, "echo")["name"], "echo")

    async def test_find_tool_returns_none_when_missing(self):
        self.assertIsNone(find_tool([], "missing"))

    async def test_call_tool(self):
        result = await self.client.call_tool("echo", {"value": "hello"})
        self.assertFalse(result["isError"])
        self.assertIn("hello", result["content"][0]["text"])

    async def test_ping(self):
        result = await self.client.ping()
        self.assertEqual(result, {})

    async def test_unknown_method_surfaces_server_error(self):
        await self.client.connect()
        with self.assertRaisesRegex(RuntimeError, "Method not found"):
            await self.client.session._request("unknown/method")

    async def test_closed_connection_rejects_requests(self):
        await self.client.connect()
        await self.client.close()
        with self.assertRaisesRegex(RuntimeError, "connection is closed"):
            await self.client.ping()

    async def test_async_context_manager(self):
        async with MCPClient(self.engine) as client:
            self.assertTrue(client.session.initialized)
            self.assertTrue(await client.ping() == {})
        self.assertTrue(client.connection.closed)


if __name__ == "__main__":
    unittest.main()