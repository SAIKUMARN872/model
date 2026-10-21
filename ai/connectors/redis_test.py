"""Redis connector tests use a fake client; no Redis server is required."""
import unittest

from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.redis import (
    RedisClient,
    RedisConnector,
    create_redis_config,
    register_redis_connector,
)


class FakeRedisClient:
    def __init__(self):
        self.calls = []

    def ping(self):
        self.calls.append(("ping",))
        return True

    def list_keys(self, pattern="*", limit=50):
        self.calls.append(("list_keys", pattern, limit))
        return ["user:1", "user:2"][:limit]

    def get_key_type(self, key):
        self.calls.append(("get_key_type", key))
        return "string"

    def get_value(self, key, limit=50):
        self.calls.append(("get_value", key, limit))
        return {"type": "string", "value": "Ada"}


class RedisTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = create_redis_config()
        self.client = FakeRedisClient()
        self.connector = RedisConnector(self.config, self.client)

    async def test_ping(self):
        result = await self.connector.execute(ConnectorRequest("ping", {}), {})
        self.assertTrue(result.success)
        self.assertTrue(result.data)

    async def test_list_keys(self):
        result = await self.connector.execute(
            ConnectorRequest("list_keys", {"pattern": "user:*", "limit": 2}), {}
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1], ("list_keys", "user:*", 2))

    async def test_get_key_type(self):
        result = await self.connector.execute(
            ConnectorRequest("get_key_type", {"key": "user:1"}), {}
        )
        self.assertTrue(result.success)
        self.assertEqual(result.data, "string")

    async def test_get_value(self):
        result = await self.connector.execute(
            ConnectorRequest("get_value", {"key": "user:1", "limit": 5}), {}
        )
        self.assertTrue(result.success)
        self.assertEqual(result.data, {"type": "string", "value": "Ada"})

    async def test_rejects_unknown_arguments(self):
        result = await self.connector.execute(
            ConnectorRequest("get_value", {"key": "user:1", "command": "FLUSHALL"}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_unknown_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("execute", {"command": "FLUSHALL"}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_key(self):
        result = await self.connector.execute(
            ConnectorRequest("get_value", {"key": "user:1\nFLUSHALL"}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_excessive_limit(self):
        result = await self.connector.execute(
            ConnectorRequest("list_keys", {"limit": 101}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_config(self):
        with self.assertRaises(ValueError):
            create_redis_config(timeout_seconds=0)
        with self.assertRaises(ValueError):
            create_redis_config(max_results=101)

    async def test_client_rejects_invalid_result_limit(self):
        with self.assertRaises(ValueError):
            RedisClient(object(), max_results=101)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_redis_connector(registry, self.config, client=self.client)
        self.assertIs(registry.get("redis"), connector)


if __name__ == "__main__":
    unittest.main()
