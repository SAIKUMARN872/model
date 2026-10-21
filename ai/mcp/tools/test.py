"""Tests for MCP tool management."""

import unittest

from ai.mcp.registry.registry import MCPRegistry
from ai.mcp.tools import MCPToolManager, tool_to_mcp_definition
from ai.tool_platform.registry import ToolRegistry, ToolSpec


def echo(**kwargs):
    return {"echo": kwargs.get("value", "")}


def make_tool(name="echo", version="1.0.0", enabled=True):
    return ToolSpec(
        name=name,
        description="Echo a value.",
        handler=echo,
        version=version,
        input_schema={
            "type": "object",
            "properties": {"value": {"type": "string"}},
            "required": ["value"],
            "additionalProperties": False,
        },
        enabled=enabled,
    )


class MCPToolManagerTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.registry = ToolRegistry()
        self.manager = MCPToolManager(self.registry)

    def test_register_and_get_tool(self):
        tool = make_tool()
        self.manager.register(tool)
        self.assertIs(self.manager.get("echo"), tool)

    def test_list_tools_returns_mcp_schema(self):
        self.manager.register(make_tool())
        listed = self.manager.list_tools()
        self.assertEqual(listed[0]["name"], "echo")
        self.assertIn("inputSchema", listed[0])

    def test_disabled_tools_hidden_by_default(self):
        self.manager.register(make_tool(enabled=False))
        self.assertEqual(self.manager.list_tools(), [])
        self.assertEqual(len(self.manager.list_tools(enabled_only=False)), 1)

    def test_duplicate_registration_rejected(self):
        self.manager.register(make_tool())
        with self.assertRaises(ValueError):
            self.manager.register(make_tool())

    def test_invalid_registry_rejected(self):
        with self.assertRaises(TypeError):
            MCPToolManager(object())

    def test_invalid_tool_rejected(self):
        with self.assertRaises(TypeError):
            self.manager.register(object())

    def test_definition_rejects_wrong_type(self):
        with self.assertRaises(TypeError):
            tool_to_mcp_definition(object())

    def test_unregister(self):
        self.manager.register(make_tool())
        self.assertTrue(self.manager.unregister("echo", "1.0.0"))
        self.assertFalse(self.manager.unregister("echo", "1.0.0"))

    async def test_execute_tool(self):
        self.manager.register(make_tool())
        result = await self.manager.execute("echo", {"value": "hello"})
        self.assertTrue(result.success)
        self.assertEqual(result.output, {"echo": "hello"})

    async def test_invalid_arguments_return_validation_error(self):
        self.manager.register(make_tool())
        result = await self.manager.execute("echo", {"value": 42})
        self.assertFalse(result.success)
        self.assertIn("VALIDATION_ERROR", result.status.name)

    async def test_missing_tool_returns_not_found(self):
        result = await self.manager.execute("missing", {})
        self.assertFalse(result.success)
        self.assertIn("NOT_FOUND", result.status.name)

    async def test_mcp_registry_can_be_supplied(self):
        registry = MCPRegistry()
        manager = MCPToolManager(registry)
        manager.register(make_tool())
        self.assertEqual(len(manager), 1)


if __name__ == "__main__":
    unittest.main()