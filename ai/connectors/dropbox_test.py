import unittest

from ai.connectors.dropbox import (
    DROPBOX_API_BASE_URL,
    DropboxConnector,
    DropboxConnectorConfig,
    register_dropbox_connector,
)
from ai.connectors.dropbox.schemas import validate_dropbox_arguments
from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry


class FakeDropboxClient:
    def __init__(self, response=None, error=None):
        self.response = response if response is not None else {"ok": True}
        self.error = error
        self.calls = []

    def request(self, path, *, token, body):
        self.calls.append({"path": path, "token": token, "body": body})
        if self.error:
            raise self.error
        return self.response


class DropboxConnectorTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = DropboxConnectorConfig()
        self.client = FakeDropboxClient()
        self.connector = DropboxConnector(self.config, self.client)
        self.credentials = {"access_token": "fake-access-token"}

    async def test_get_current_account_uses_fixed_endpoint(self):
        result = await self.connector.execute(
            ConnectorRequest("get_current_account", {}), self.credentials
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["path"], "/2/users/get_current_account"
        )
        self.assertEqual(self.client.calls[0]["body"], {})

    async def test_list_folder_builds_expected_body(self):
        result = await self.connector.execute(
            ConnectorRequest("list_folder", {"path": "/reports", "limit": 25}),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["body"],
            {"path": "/reports", "recursive": False, "limit": 25},
        )

    async def test_get_metadata(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "get_metadata",
                {"path": "/reports/file.pdf", "include_deleted": False},
            ),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["path"], "/2/files/get_metadata"
        )
        self.assertEqual(
            self.client.calls[0]["body"],
            {"path": "/reports/file.pdf", "include_deleted": False},
        )

    async def test_search_builds_options(self):
        result = await self.connector.execute(
            ConnectorRequest("search", {"query": "invoice", "max_results": 10}),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["body"],
            {"query": "invoice", "options": {"max_results": 10}},
        )

    async def test_missing_token_fails_without_request(self):
        result = await self.connector.execute(
            ConnectorRequest("get_current_account", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation_is_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_everything", {}), self.credentials
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_relative_nonempty_path_without_slash(self):
        result = await self.connector.execute(
            ConnectorRequest("get_metadata", {"path": "reports/file.pdf"}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_limit(self):
        result = await self.connector.execute(
            ConnectorRequest("list_folder", {"path": "/", "limit": 9000}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_empty_search(self):
        result = await self.connector.execute(
            ConnectorRequest("search", {"query": "   "}), self.credentials
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_transport_error_does_not_leak_token(self):
        client = FakeDropboxClient(error=RuntimeError("fake-access-token"))
        connector = DropboxConnector(self.config, client)
        result = await connector.execute(
            ConnectorRequest("get_current_account", {}), self.credentials
        )
        self.assertFalse(result.success)
        self.assertNotIn("fake-access-token", result.error)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_dropbox_connector(registry, self.config, self.client)
        self.assertIs(registry.get("dropbox"), connector)

    async def test_api_host_is_fixed(self):
        self.assertEqual(self.config.transport.base_url, DROPBOX_API_BASE_URL)
        self.assertEqual(
            tuple(self.config.transport.allowed_hosts), ("api.dropboxapi.com",)
        )


if __name__ == "__main__":
    unittest.main()
