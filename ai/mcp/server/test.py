"""Tests for MCP server routes and JSON-RPC request handling."""

import unittest

from ai.mcp.constants import JSONRPC_VERSION
from ai.mcp.engine import MCPEngine
from ai.mcp.protocol.messages import request
from ai.mcp.resources.manager import MCPResourceManager
from ai.mcp.resources.resource import MCPResource
from ai.mcp.server.routes import list_resources, read_resource
from ai.mcp.server.utils import validate_resource_read_params
from ai.tool_platform.registry import ToolRegistry, ToolSpec


def echo_tool(**arguments):
    return {"echo": arguments.get("value", "")}


class MCPServerRouteTests(unittest.TestCase):
    def setUp(self):
        self.manager = MCPResourceManager()
        self.manager.register(MCPResource(
            uri="modelnow://docs/intro",
            name="Introduction",
            mime_type="text/plain",
            text="Welcome to ModelNow.",
            description="Introductory document",
        ))

    def test_list_resources(self):
        result = list_resources(self.manager)
        self.assertEqual(len(result["resources"]), 1)
        self.assertEqual(result["resources"][0]["uri"], "modelnow://docs/intro")
        self.assertNotIn("text", result["resources"][0])

    def test_read_text_resource(self):
        result = read_resource(
            self.manager, {"uri": "modelnow://docs/intro"}
        )
        self.assertEqual(
            result["contents"][0]["text"], "Welcome to ModelNow."
        )

    def test_read_binary_resource(self):
        self.manager.register(MCPResource(
            uri="modelnow://assets/file",
            name="File",
            mime_type="application/octet-stream",
            blob=b"\x00\x01",
        ))
        result = read_resource(
            self.manager, {"uri": "modelnow://assets/file"}
        )
        self.assertEqual(result["contents"][0]["blob"], "AAE=")

    def test_missing_resource_raises_key_error(self):
        with self.assertRaises(KeyError):
            read_resource(self.manager, {"uri": "modelnow://missing"})

    def test_invalid_read_params_rejected(self):
        for params in (None, [], {}, {"uri": " "}):
            with self.subTest(params=params):
                with self.assertRaises(ValueError):
                    validate_resource_read_params(params)

    def test_list_rejects_wrong_manager(self):
        with self.assertRaises(TypeError):
            list_resources(object())

    def test_read_rejects_wrong_manager(self):
        with self.assertRaises(TypeError):
            read_resource(object(), {"uri": "modelnow://docs/intro"})

    def test_resources_list_through_engine(self):
        engine = MCPEngine(resource_manager=self.manager)
        response = self._run(engine, request("resources/list", request_id=1))
        self.assertEqual(response["jsonrpc"], JSONRPC_VERSION)
        self.assertIn("result", response)
        self.assertEqual(len(response["result"]["resources"]), 1)

    def test_resources_read_through_engine(self):
        engine = MCPEngine(resource_manager=self.manager)
        response = self._run(
            engine,
            request(
                "resources/read",
                {"uri": "modelnow://docs/intro"},
                request_id=2,
            ),
        )
        self.assertEqual(
            response["result"]["contents"][0]["text"],
            "Welcome to ModelNow.",
        )

    def test_unknown_resource_returns_resource_error(self):
        engine = MCPEngine(resource_manager=self.manager)
        response = self._run(
            engine,
            request(
                "resources/read",
                {"uri": "modelnow://missing"},
                request_id=3,
            ),
        )
        self.assertEqual(response["error"]["code"], -32002)

    def test_tool_call_still_works(self):
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
        engine = MCPEngine(registry, resource_manager=self.manager)
        response = self._run(
            engine,
            request(
                "tools/call",
                {"name": "echo", "arguments": {"value": "hello"}},
                request_id=4,
            ),
        )
        self.assertNotIn("error", response)
        self.assertFalse(response["result"]["isError"])
        self.assertIn("hello", response["result"]["content"][0]["text"])

    def test_engine_uses_mcp_executor_adapter(self):
        from ai.mcp.tools.executor import MCPToolExecutor

        engine = MCPEngine()
        self.assertIsInstance(engine.mcp_tool_executor, MCPToolExecutor)
        self.assertIs(engine.mcp_tool_executor.registry, engine.registry)
        self.assertIs(engine.mcp_tool_executor.executor, engine.executor)

    def test_invalid_mcp_arguments_do_not_execute_tool(self):
        calls = []

        def tracked_tool(**arguments):
            calls.append(arguments)
            return {"ok": True}

        registry = ToolRegistry()
        registry.register(ToolSpec(
            name="tracked",
            description="Test validation.",
            handler=tracked_tool,
            input_schema={
                "type": "object",
                "properties": {"value": {"type": "string"}},
                "required": ["value"],
                "additionalProperties": False,
            },
        ))
        engine = MCPEngine(registry)
        response = self._run(
            engine,
            request(
                "tools/call",
                {"name": "tracked", "arguments": {"value": "ok", "extra": 1}},
                request_id=5,
            ),
        )
        self.assertIn("error", response)
        self.assertEqual(response["error"]["code"], -32602)
        self.assertIn("Unexpected arguments", response["error"]["message"])
        self.assertEqual(calls, [])

    @staticmethod
    def _run(engine, message):
        import asyncio
        return asyncio.run(engine.handle(message))


if __name__ == "__main__":
    unittest.main()
