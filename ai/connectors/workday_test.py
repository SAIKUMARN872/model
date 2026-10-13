"""Mock-based tests for configured Workday operations."""
import unittest

from ai.connectors.exceptions import ConnectorConfigurationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.workday import (
    WorkdayConfig, WorkdayOperationConfig, WorkdayConnector,
    register_workday_connector,
)


class FakeWorkdayClient:
    def __init__(self):
        self.calls = []

    def get(self, path, *, query=None, access_token=None):
        self.calls.append((path, query, access_token))
        return {"data": []}


def make_config():
    return WorkdayConfig(
        base_url="https://example.workday.com",
        allowed_hosts=("example.workday.com",),
        operations=(
            WorkdayOperationConfig(
                name="list_workers",
                path="/ccx/api/v1/tenant/workers",
            ),
            WorkdayOperationConfig(
                name="get_worker",
                path="/ccx/api/v1/tenant/workers/{worker_id}",
                path_parameters=("worker_id",),
            ),
        ),
    )


class WorkdayTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = make_config()
        self.client = FakeWorkdayClient()
        self.connector = WorkdayConnector(self.config, self.client)

    async def test_list_workers(self):
        result = await self.connector.execute(
            ConnectorRequest("list_workers", {"limit": 25, "offset": 10}),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], "/ccx/api/v1/tenant/workers")
        self.assertEqual(self.client.calls[-1][1], {"limit": "25", "offset": "10"})

    async def test_get_worker(self):
        result = await self.connector.execute(
            ConnectorRequest("get_worker", {"path_params": {"worker_id": "W-123"}}),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], "/ccx/api/v1/tenant/workers/W-123")

    async def test_path_parameter_is_encoded(self):
        result = await self.connector.execute(
            ConnectorRequest("get_worker", {"path_params": {"worker_id": "W/123"}}),
            {"access_token": "fake"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[-1][0], "/ccx/api/v1/tenant/workers/W%2F123")

    async def test_missing_token(self):
        result = await self.connector.execute(
            ConnectorRequest("list_workers", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unconfigured_operation(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_worker", {}), {"access_token": "fake"}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_arguments(self):
        result = await self.connector.execute(
            ConnectorRequest("list_workers", {"url": "https://attacker.example"}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_limit_is_bounded(self):
        result = await self.connector.execute(
            ConnectorRequest("list_workers", {"limit": 9999}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_query_values_must_be_scalar(self):
        result = await self.connector.execute(
            ConnectorRequest("list_workers", {"query": {"filter": {"role": "admin"}}}),
            {"access_token": "fake"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_invalid_base_host(self):
        with self.assertRaises(ConnectorConfigurationError):
            WorkdayConfig(
                base_url="https://example.workday.com",
                allowed_hosts=("other.workday.com",),
                operations=(WorkdayOperationConfig("list_workers", "/workers"),),
            )

    async def test_path_placeholder_must_be_declared(self):
        with self.assertRaises(ConnectorConfigurationError):
            WorkdayOperationConfig("get_worker", "/workers/{worker_id}")

    async def test_registration(self):
        registry = ConnectorRegistry()
        connector = register_workday_connector(
            registry, self.config, client=self.client
        )
        self.assertIs(registry.get("workday"), connector)


if __name__ == "__main__":
    unittest.main()
