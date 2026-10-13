"""Tests for the ModelNow tool platform executor."""

import asyncio
import unittest

from ai.tool_platform.executor import ExecutionStatus, ToolExecutor
from ai.tool_platform.permissions import PermissionContext
from ai.tool_platform.registry import ToolRegistry, ToolSpec


class ToolExecutorTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.registry = ToolRegistry()
        self.executor = ToolExecutor(self.registry, timeout_seconds=0.2)

    def register(
        self,
        handler,
        *,
        name="test.echo",
        schema=None,
        permissions=(),
        enabled=True,
        version="1.0.0",
    ):
        self.registry.register(
            ToolSpec(
                name=name,
                description="Executor test tool",
                handler=handler,
                version=version,
                input_schema=schema or {
                    "type": "object",
                    "properties": {"message": {"type": "string"}},
                    "required": ["message"],
                    "additionalProperties": False,
                },
                required_permissions=permissions,
                enabled=enabled,
            )
        )

    async def test_successful_sync_handler(self):
        self.register(lambda message: message.upper())
        result = await self.executor.execute(
            "test.echo", {"message": "hello"}
        )
        self.assertTrue(result.success)
        self.assertEqual(result.status, ExecutionStatus.SUCCESS)
        self.assertEqual(result.output, "HELLO")
        self.assertEqual(result.version, "1.0.0")
        self.assertGreaterEqual(result.duration_seconds, 0)

    async def test_successful_async_handler(self):
        async def handler(message):
            return f"async:{message}"

        self.register(handler)
        result = await self.executor.execute(
            "test.echo", {"message": "hello"}
        )
        self.assertTrue(result.success)
        self.assertEqual(result.output, "async:hello")

    async def test_missing_tool(self):
        result = await self.executor.execute("missing.tool")
        self.assertFalse(result.success)
        self.assertEqual(result.status, ExecutionStatus.NOT_FOUND)

    async def test_disabled_tool(self):
        self.register(lambda message: message, enabled=False)
        result = await self.executor.execute(
            "test.echo", {"message": "hello"}
        )
        self.assertEqual(result.status, ExecutionStatus.DISABLED)

    async def test_required_argument_missing(self):
        self.register(lambda message: message)
        result = await self.executor.execute("test.echo", {})
        self.assertEqual(result.status, ExecutionStatus.VALIDATION_ERROR)

    async def test_wrong_argument_type(self):
        self.register(lambda message: message)
        result = await self.executor.execute(
            "test.echo", {"message": 123}
        )
        self.assertEqual(result.status, ExecutionStatus.VALIDATION_ERROR)

    async def test_unknown_argument_rejected(self):
        self.register(lambda message: message)
        result = await self.executor.execute(
            "test.echo",
            {"message": "hello", "unexpected": True},
        )
        self.assertEqual(result.status, ExecutionStatus.VALIDATION_ERROR)

    async def test_permission_required_without_context(self):
        self.register(
            lambda message: message,
            permissions=("tools:execute",),
        )
        result = await self.executor.execute(
            "test.echo", {"message": "hello"}
        )
        self.assertEqual(result.status, ExecutionStatus.PERMISSION_DENIED)

    async def test_permission_granted(self):
        self.register(
            lambda message: message,
            permissions=("tools:execute",),
        )
        context = PermissionContext(
            user_id="test-user",
            permissions=frozenset({"tools:execute"}),
        )
        result = await self.executor.execute(
            "test.echo",
            {"message": "hello"},
            context=context,
        )
        self.assertTrue(result.success)

    async def test_handler_exception(self):
        def fail(message):
            raise RuntimeError("handler failed")

        self.register(fail)
        result = await self.executor.execute(
            "test.echo", {"message": "hello"}
        )
        self.assertEqual(result.status, ExecutionStatus.ERROR)
        self.assertIn("handler failed", result.error)

    async def test_timeout(self):
        async def slow(message):
            await asyncio.sleep(1)
            return message

        self.register(slow)
        result = await self.executor.execute(
            "test.echo", {"message": "hello"}
        )
        self.assertEqual(result.status, ExecutionStatus.TIMEOUT)

    async def test_specific_version(self):
        self.register(
            lambda message: f"v1:{message}",
            version="1.0.0",
        )
        self.register(
            lambda message: f"v2:{message}",
            version="2.0.0",
        )
        result = await self.executor.execute(
            "test.echo",
            {"message": "hello"},
            version="1.0.0",
        )
        self.assertTrue(result.success)
        self.assertEqual(result.output, "v1:hello")
        self.assertEqual(result.version, "1.0.0")

    async def test_invalid_tool_name(self):
        result = await self.executor.execute(" ")
        self.assertEqual(result.status, ExecutionStatus.VALIDATION_ERROR)

    async def test_result_dictionary(self):
        self.register(lambda message: message)
        result = await self.executor.execute(
            "test.echo", {"message": "hello"}
        )
        data = result.to_dict()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["tool_name"], "test.echo")
        self.assertIn("duration_seconds", data)


if __name__ == "__main__":
    unittest.main()
