"""Jira connector tests with a fake client."""

import unittest

from ai.connectors.config import ConnectorConfig
from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.jira import (
    JiraConnector,
    create_jira_config,
    register_jira_connector,
)


class FakeClient:
    def __init__(self, response=None, error=None):
        self.response = response if response is not None else {}
        self.error = error
        self.calls = []

    def request(self, method, path, *, token, query=None):
        self.calls.append((method, path, token, query))
        if self.error:
            raise self.error
        return self.response


def make_config():
    return create_jira_config("https://modelnow-test.atlassian.net")


class JiraConnectorTests(unittest.IsolatedAsyncioTestCase):
    async def test_search_issues(self):
        client = FakeClient({"issues": []})
        connector = JiraConnector(make_config(), client)
        result = await connector.execute(
            ConnectorRequest("search_issues", {
                "jql": "project = MN",
                "max_results": 10,
            }),
            {"token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], "/rest/api/3/search")
        self.assertEqual(client.calls[0][3]["max_results"], 10)

    async def test_get_issue(self):
        client = FakeClient({"key": "MN-123"})
        connector = JiraConnector(make_config(), client)
        result = await connector.execute(
            ConnectorRequest("get_issue", {"issue_key": "MN-123"}),
            {"token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], "/rest/api/3/issue/MN-123")

    async def test_list_projects(self):
        client = FakeClient({"values": []})
        connector = JiraConnector(make_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_projects", {"max_results": 20}),
            {"token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(client.calls[0][1], "/rest/api/3/project/search")

    async def test_get_issue_comments(self):
        client = FakeClient({"comments": []})
        connector = JiraConnector(make_config(), client)
        result = await connector.execute(
            ConnectorRequest("get_issue_comments", {"issue_key": "MN-12"}),
            {"token": "test-token"},
        )
        self.assertTrue(result.success)
        self.assertEqual(
            client.calls[0][1],
            "/rest/api/3/issue/MN-12/comment",
        )

    async def test_invalid_issue_key_is_rejected(self):
        client = FakeClient()
        connector = JiraConnector(make_config(), client)
        result = await connector.execute(
            ConnectorRequest("get_issue", {"issue_key": "../private"}),
            {"token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_invalid_page_size_is_rejected(self):
        client = FakeClient()
        connector = JiraConnector(make_config(), client)
        result = await connector.execute(
            ConnectorRequest("search_issues", {
                "jql": "project = MN",
                "max_results": 500,
            }),
            {"token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_missing_token_is_rejected(self):
        client = FakeClient()
        connector = JiraConnector(make_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_projects", {}),
            {},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_unknown_operation_is_rejected(self):
        client = FakeClient()
        connector = JiraConnector(make_config(), client)
        result = await connector.execute(
            ConnectorRequest("delete_issue", {"issue_key": "MN-12"}),
            {"token": "test-token"},
        )
        self.assertFalse(result.success)
        self.assertEqual(client.calls, [])

    async def test_transport_error_does_not_leak_token(self):
        client = FakeClient(error=RuntimeError("private-token-value"))
        connector = JiraConnector(make_config(), client)
        result = await connector.execute(
            ConnectorRequest("list_projects", {}),
            {"token": "private-token-value"},
        )
        self.assertFalse(result.success)
        self.assertNotIn("private-token-value", result.error)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_jira_connector(
            registry, make_config(), client=FakeClient()
        )
        self.assertIs(registry.get("jira"), connector)

    async def test_rejects_non_https_or_untrusted_tenant(self):
        for url in (
            "http://modelnow-test.atlassian.net",
            "https://atlassian.net",
            "https://modelnow-test.atlassian.net.evil.example",
        ):
            with self.subTest(url=url):
                with self.assertRaises(ValueError):
                    create_jira_config(url)

    async def test_tenant_host_is_exactly_allowlisted(self):
        config = make_config()
        self.assertEqual(
            config.transport.allowed_hosts,
            ("modelnow-test.atlassian.net",),
        )


if __name__ == "__main__":
    unittest.main()
