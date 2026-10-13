"""Unit tests for the read-only Google Drive connector."""
import unittest

from ai.connectors.google_drive import (
    GoogleDriveConnector,
    register_google_drive_connector,
)
from ai.connectors.google_drive.config import (
    GOOGLE_DRIVE_API_BASE_URL,
    GOOGLE_DRIVE_ALLOWED_HOSTS,
)
from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorRequest


class FakeClient:
    def __init__(self, result=None, error=None):
        self.result = result if result is not None else {"files": []}
        self.error = error
        self.calls = []

    def request(self, path, *, access_token, query=None):
        self.calls.append((path, access_token, query))
        if self.error:
            raise self.error
        return self.result


class FakeRegistry:
    def __init__(self):
        self.items = []

    def register(self, connector):
        self.items.append(connector)


class GoogleDriveConnectorTests(unittest.IsolatedAsyncioTestCase):
    async def test_list_files(self):
        client = FakeClient({"files": [{"id": "abc", "name": "Report"}]})
        connector = GoogleDriveConnector(client)
        result = await connector.execute(
            ConnectorRequest("list_files", {"page_size": 20}),
            {"access_token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][0], "/files")
        self.assertEqual(client.calls[0][2]["pageSize"], 20)

    async def test_search_files(self):
        client = FakeClient()
        connector = GoogleDriveConnector(client)
        result = await connector.execute(
            ConnectorRequest("search_files", {"query": "name contains 'report'"}),
            {"access_token": "token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][2]["q"], "name contains 'report'")

    async def test_get_file(self):
        client = FakeClient({"id": "abc", "name": "Report"})
        connector = GoogleDriveConnector(client)
        result = await connector.execute(
            ConnectorRequest("get_file", {"file_id": "abc_123"}),
            {"access_token": "token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][0], "/files/abc_123")

    async def test_missing_token_fails_without_request(self):
        client = FakeClient()
        connector = GoogleDriveConnector(client)
        result = await connector.execute(
            ConnectorRequest("list_files", {}),
            {},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_rejects_invalid_file_id(self):
        client = FakeClient()
        connector = GoogleDriveConnector(client)
        result = await connector.execute(
            ConnectorRequest("get_file", {"file_id": "../secrets"}),
            {"access_token": "token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_rejects_invalid_page_size(self):
        client = FakeClient()
        connector = GoogleDriveConnector(client)
        result = await connector.execute(
            ConnectorRequest("list_files", {"page_size": True}),
            {"access_token": "token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_rejects_empty_search(self):
        client = FakeClient()
        connector = GoogleDriveConnector(client)
        result = await connector.execute(
            ConnectorRequest("search_files", {"query": "  "}),
            {"access_token": "token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_transport_error_does_not_leak_token(self):
        client = FakeClient(error=RuntimeError("token=secret-value"))
        connector = GoogleDriveConnector(client)
        result = await connector.execute(
            ConnectorRequest("list_files", {}),
            {"access_token": "secret-value"},
        )
        self.assertFalse(result.success)
        self.assertNotIn("secret-value", result.error)

    async def test_registration_helper(self):
        registry = FakeRegistry()
        connector = register_google_drive_connector(
            registry, client=FakeClient()
        )
        self.assertIs(registry.items[0], connector)
        self.assertEqual(connector.metadata.name, "google_drive")

    async def test_rejects_unknown_operation(self):
        client = FakeClient()
        connector = GoogleDriveConnector(client)
        result = await connector.execute(
            ConnectorRequest("delete_file", {"file_id": "abc"}),
            {"access_token": "token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    def test_api_host_is_fixed(self):
        self.assertEqual(
            GOOGLE_DRIVE_API_BASE_URL,
            "https://www.googleapis.com/drive/v3",
        )
        self.assertEqual(GOOGLE_DRIVE_ALLOWED_HOSTS, ("www.googleapis.com",))


if __name__ == "__main__":
    unittest.main()
