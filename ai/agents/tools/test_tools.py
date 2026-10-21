"""Tests for ModelNow's agent tools subsystem."""

import asyncio
import unittest

from ai.agents.tools import (
    ToolAdapter,
    ToolDefinition,
    ToolExecutor,
    ToolRegistry,
)


class ToolAdapterTests(unittest.TestCase):
    def test_adapts_callable(self):
        def add(a, b):
            """Add two numbers."""
            return a + b

        tool = ToolAdapter.adapt("add", add)
        self.assertEqual(tool.name, "add")
        self.assertEqual(tool.description, "Add two numbers.")

    def test_rejects_invalid_name(self):
        with self.assertRaises(ValueError):
            ToolDefinition("bad name", "Description", lambda: None)

    def test_rejects_non_callable(self):
        with self.assertRaises(ValueError):
            ToolDefinition("sample", "Description", 123)


class ToolRegistryTests(unittest.TestCase):
    def setUp(self):
        self.registry = ToolRegistry()

    def test_register_and_get(self):
        tool = self.registry.register_function(
            "greet", lambda name: f"Hello {name}", "Greet a user."
        )
        self.assertIs(self.registry.get("greet"), tool)

    def test_rejects_duplicate(self):
        self.registry.register_function("work", lambda: 1, "Do work.")
        with self.assertRaises(ValueError):
            self.registry.register_function("work", lambda: 2, "Other work.")

    def test_unregister(self):
        self.registry.register_function("work", lambda: 1, "Do work.")
        self.assertTrue(self.registry.unregister("work"))
        self.assertFalse(self.registry.unregister("work"))

    def test_unknown_tool(self):
        with self.assertRaises(KeyError):
            self.registry.get("missing")


class ToolExecutorTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.registry = ToolRegistry()
        self.executor = ToolExecutor(self.registry)

    async def test_executes_sync_tool(self):
        self.registry.register_function("add", lambda a, b: a + b, "Add values.")
        result = await self.executor.execute("add", {"a": 2, "b": 3})
        self.assertTrue(result.success)
        self.assertEqual(result.output, 5)

    async def test_executes_async_tool(self):
        async def fetch(value):
            return f"result:{value}"

        self.registry.register_function("fetch", fetch, "Fetch a value.")
        result = await self.executor.execute("fetch", {"value": "x"})
        self.assertTrue(result.success)
        self.assertEqual(result.output, "result:x")

    async def test_invalid_arguments_return_error(self):
        self.registry.register_function("add", lambda a, b: a + b, "Add values.")
        result = await self.executor.execute("add", {"a": 2})
        self.assertFalse(result.success)
        self.assertIn("Invalid arguments", result.error)

    async def test_tool_exception_is_normalized(self):
        def broken():
            raise RuntimeError("failure")

        self.registry.register_function("broken", broken, "Fail deliberately.")
        result = await self.executor.execute("broken")
        self.assertFalse(result.success)
        self.assertIn("RuntimeError", result.error)

    async def test_unknown_tool_returns_error(self):
        result = await self.executor.execute("missing")
        self.assertFalse(result.success)
        self.assertIn("not registered", result.error)

    async def test_timeout(self):
        async def slow():
            await asyncio.sleep(0.1)
            return "late"

        self.registry.register_function("slow", slow, "A slow tool.")
        executor = ToolExecutor(self.registry, timeout_seconds=0.01)
        result = await executor.execute("slow")
        self.assertFalse(result.success)
        self.assertIn("timed out", result.error)

    async def test_rejects_non_dictionary_arguments(self):
        self.registry.register_function("noop", lambda: "ok", "No operation.")
        result = await self.executor.execute("noop", ["invalid"])
        self.assertFalse(result.success)


if __name__ == "__main__":
    unittest.main()
