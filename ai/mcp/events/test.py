"""Tests for the MCP events subsystem."""

import asyncio
import unittest
from datetime import datetime

from .dispatcher import MCPEventDispatcher
from .events import MCPEvent
from .listener import MCPEventListener


class MCPEventModelTests(unittest.TestCase):
    def test_event_defaults_and_serialization(self):
        event = MCPEvent(" resource.updated ", {"uri": "memory://x"})
        result = event.to_dict()
        self.assertEqual(event.name, "resource.updated")
        self.assertEqual(result["payload"]["uri"], "memory://x")
        self.assertIn("timestamp", result)

    def test_empty_name_rejected(self):
        with self.assertRaises(ValueError):
            MCPEvent(" ")

    def test_non_mapping_payload_rejected(self):
        with self.assertRaises(TypeError):
            MCPEvent("x", payload=[])

    def test_naive_timestamp_rejected(self):
        with self.assertRaises(ValueError):
            MCPEvent("x", timestamp=datetime(2025, 1, 1))

    def test_payload_is_read_only(self):
        event = MCPEvent("x", {"a": 1})
        with self.assertRaises(TypeError):
            event.payload["a"] = 2


class MCPEventListenerTests(unittest.TestCase):
    def test_non_callable_handler_rejected(self):
        with self.assertRaises(TypeError):
            MCPEventListener(handler=42)

    def test_listener_id_generated(self):
        listener = MCPEventListener(handler=lambda event: None)
        self.assertTrue(listener.listener_id)

    def test_empty_event_name_rejected(self):
        with self.assertRaises(ValueError):
            MCPEventListener(handler=lambda event: None, event_name=" ")


class MCPEventDispatcherTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.dispatcher = MCPEventDispatcher()

    async def test_matching_listener_receives_event(self):
        received = []
        await self.dispatcher.subscribe(
            "task.done", lambda event: received.append(event.payload["id"])
        )
        result = await self.dispatcher.publish("task.done", {"id": 7})
        self.assertEqual(received, [7])
        self.assertEqual(result.delivered, 1)
        self.assertTrue(result.success)

    async def test_non_matching_event_is_ignored(self):
        received = []
        await self.dispatcher.subscribe(
            "task.done", lambda event: received.append(event.name)
        )
        result = await self.dispatcher.publish("task.started")
        self.assertEqual(received, [])
        self.assertEqual(result.delivered, 0)

    async def test_wildcard_listener(self):
        received = []
        await self.dispatcher.subscribe(
            None, lambda event: received.append(event.name)
        )
        await self.dispatcher.publish("alpha")
        await self.dispatcher.publish("beta")
        self.assertEqual(received, ["alpha", "beta"])

    async def test_async_handler(self):
        received = []

        async def handler(event):
            await asyncio.sleep(0)
            received.append(event.name)

        await self.dispatcher.subscribe("async.event", handler)
        result = await self.dispatcher.publish("async.event")
        self.assertEqual(received, ["async.event"])
        self.assertEqual(result.delivered, 1)

    async def test_failure_does_not_block_other_handlers(self):
        received = []

        def broken(event):
            raise RuntimeError("listener failed")

        await self.dispatcher.subscribe("x", broken)
        await self.dispatcher.subscribe(
            "x", lambda event: received.append("ok")
        )
        result = await self.dispatcher.publish("x")
        self.assertEqual(received, ["ok"])
        self.assertEqual(result.delivered, 1)
        self.assertFalse(result.success)
        self.assertIn("RuntimeError", result.failures[0][1])

    async def test_unsubscribe(self):
        received = []
        listener_id = await self.dispatcher.subscribe(
            "x", lambda event: received.append(1)
        )
        self.assertTrue(await self.dispatcher.unsubscribe(listener_id))
        self.assertFalse(await self.dispatcher.unsubscribe(listener_id))
        await self.dispatcher.publish("x")
        self.assertEqual(received, [])

    async def test_add_and_list_listener(self):
        listener = MCPEventListener(
            handler=lambda event: None,
            event_name="x",
            listener_id="fixed-id",
        )
        self.assertEqual(await self.dispatcher.add_listener(listener), "fixed-id")
        self.assertEqual(len(await self.dispatcher.list_listeners()), 1)
        with self.assertRaises(ValueError):
            await self.dispatcher.add_listener(listener)

    async def test_invalid_dispatch_input(self):
        with self.assertRaises(TypeError):
            await self.dispatcher.dispatch("not an event")

    async def test_concurrent_dispatch(self):
        received = []

        async def handler(event):
            await asyncio.sleep(0)
            received.append(event.payload["n"])

        await self.dispatcher.subscribe("concurrent", handler)
        results = await asyncio.gather(*(
            self.dispatcher.publish("concurrent", {"n": n})
            for n in range(10)
        ))
        self.assertEqual(len(results), 10)
        self.assertEqual(sorted(received), list(range(10)))


if __name__ == "__main__":
    unittest.main()