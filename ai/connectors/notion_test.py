"""Unit tests for the read-only Notion connector."""
from __future__ import annotations

import unittest

from ai.connectors.exceptions import ConnectorRequestError
from ai.connectors.models import ConnectorRequest
from ai.connectors.notion.client import NotionClient
from ai.connectors.notion.config import NotionConfig, default_config
from ai.connectors.notion.connector import NotionConnector
from ai.connectors.notion.models import extract_title, is_notion_id
from ai.connectors.notion.schemas import validate_arguments


VALID_ID = "12345678-1234-1234-1234-123456789abc"


class FakeHTTPClient:
    def __init__(self, response=None):
        self.response = response if response is not None else {"results": []}
        self.calls = []

    def request(self, method, path, **kwargs):
        self.calls.append((method, path, kwargs))
        return self.response


class FakeNotionClient:
    def __init__(self, response=None):
        self.response = response if response is not None else {"results": []}
        self.calls = []

    def request(self, path, **kwargs):
        self.calls.append((path, kwargs))
        return self.response


class NotionConnectorTests(unittest.IsolatedAsyncioTestCase):
    async def test_search_pages_uses_page_filter(self):
        client = FakeNotionClient({"results": [{"id": VALID_ID}]})
        connector = NotionConnector(client)
        result = await connector.execute(
            ConnectorRequest("search_pages", {"query": "roadmap", "page_size": 10}),
            {"access_token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][0], "/search")
        self.assertEqual(client.calls[0][1]["method"], "POST")
        self.assertEqual(client.calls[0][1]["body"]["filter"]["value"], "page")
        self.assertEqual(client.calls[0][1]["body"]["query"], "roadmap")

    async def test_search_data_sources_uses_data_source_filter(self):
        client = FakeNotionClient()
        connector = NotionConnector(client)
        result = await connector.execute(
            ConnectorRequest("search_data_sources", {}),
            {"access_token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(
            client.calls[0][1]["body"]["filter"]["value"], "data_source"
        )

    async def test_get_page_uses_page_endpoint(self):
        client = FakeNotionClient({"id": VALID_ID})
        result = await NotionConnector(client).execute(
            ConnectorRequest("get_page", {"page_id": VALID_ID}),
            {"access_token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][0], f"/pages/{VALID_ID}")

    async def test_get_data_source_uses_data_source_endpoint(self):
        client = FakeNotionClient({"id": VALID_ID})
        result = await NotionConnector(client).execute(
            ConnectorRequest("get_data_source", {"data_source_id": VALID_ID}),
            {"access_token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][0], f"/data_sources/{VALID_ID}")

    async def test_query_data_source_posts_filter_and_sorts(self):
        client = FakeNotionClient({"results": []})
        result = await NotionConnector(client).execute(
            ConnectorRequest(
                "query_data_source",
                {
                    "data_source_id": VALID_ID,
                    "page_size": 5,
                    "filter": {"property": "Status", "select": {"equals": "Done"}},
                    "sorts": [{"property": "Name", "direction": "ascending"}],
                },
            ),
            {"access_token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(
            client.calls[0][0], f"/data_sources/{VALID_ID}/query"
        )
        self.assertEqual(client.calls[0][1]["method"], "POST")
        self.assertEqual(client.calls[0][1]["body"]["page_size"], 5)
        self.assertIn("filter", client.calls[0][1]["body"])

    async def test_missing_token_fails_without_request(self):
        client = FakeNotionClient()
        result = await NotionConnector(client).execute(
            ConnectorRequest("search_pages", {}),
            {},
        )
        self.assertFalse(result.success)
        self.assertIn("token is missing", result.error)
        self.assertEqual(client.calls, [])

    async def test_invalid_page_id_is_rejected(self):
        client = FakeNotionClient()
        result = await NotionConnector(client).execute(
            ConnectorRequest("get_page", {"page_id": "../../admin"}),
            {"access_token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_page_size_is_bounded(self):
        client = FakeNotionClient()
        result = await NotionConnector(client).execute(
            ConnectorRequest("search_pages", {"page_size": 101}),
            {"access_token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_unknown_arguments_are_rejected(self):
        client = FakeNotionClient()
        result = await NotionConnector(client).execute(
            ConnectorRequest("search_pages", {"url": "https://evil.example"}),
            {"access_token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_unknown_operation_is_rejected(self):
        client = FakeNotionClient()
        result = await NotionConnector(client).execute(
            ConnectorRequest("delete_page", {"page_id": VALID_ID}),
            {"access_token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_api_errors_are_sanitized(self):
        class BrokenClient:
            def request(self, path, **kwargs):
                raise ConnectorRequestError("provider error contains sensitive details")

        result = await NotionConnector(BrokenClient()).execute(
            ConnectorRequest("search_pages", {}),
            {"access_token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(result.error, "Notion API request failed.")
        self.assertNotIn("sensitive", result.error)

    async def test_connector_only_exposes_read_operations(self):
        connector = NotionConnector(FakeNotionClient())
        self.assertEqual(
            set(connector.metadata.operations),
            {
                "search_pages",
                "search_data_sources",
                "get_page",
                "get_data_source",
                "query_data_source",
            },
        )
        self.assertIn("notion:read", connector.metadata.required_permissions)

    async def test_client_sends_notion_version_and_bearer_token(self):
        http = FakeHTTPClient({"ok": True})
        client = NotionClient(default_config(), http_client=http)
        response = client.request(
            "/search",
            access_token="example-token",
            method="POST",
            body={"query": "notes"},
        )
        self.assertEqual(response, {"ok": True})
        method, path, kwargs = http.calls[0]
        self.assertEqual(method, "POST")
        self.assertEqual(path, "/search")
        self.assertEqual(kwargs["headers"]["Authorization"], "Bearer example-token")
        self.assertEqual(
            kwargs["headers"]["Notion-Version"], NotionConfig().api_version
        )

    async def test_invalid_configuration_is_rejected(self):
        with self.assertRaises(ValueError):
            NotionConfig(api_version="invalid")
        with self.assertRaises(ValueError):
            NotionConfig(credential_env_var="not-valid")

    async def test_notion_id_and_title_helpers(self):
        self.assertTrue(is_notion_id(VALID_ID))
        self.assertTrue(is_notion_id(VALID_ID.replace("-", "")))
        self.assertFalse(is_notion_id("../bad"))
        self.assertEqual(
            extract_title({
                "properties": {
                    "Name": {
                        "type": "title",
                        "title": [{"plain_text": "ModelNow"}, {"plain_text": " Docs"}],
                    }
                }
            }),
            "ModelNow Docs",
        )

    async def test_cursor_and_sort_direction_are_validated(self):
        client = FakeNotionClient()
        connector = NotionConnector(client)
        bad_cursor = await connector.execute(
            ConnectorRequest("search_pages", {"start_cursor": ""}),
            {"access_token": "test-token"},
        )
        bad_sort = await connector.execute(
            ConnectorRequest("search_pages", {"sort_direction": "sideways"}),
            {"access_token": "test-token"},
        )
        self.assertFalse(bad_cursor.success)
        self.assertFalse(bad_sort.success)
        self.assertEqual(client.calls, [])


if __name__ == "__main__":
    unittest.main()
