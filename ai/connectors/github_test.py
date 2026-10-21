import unittest

from ai.connectors.github import (
    GITHUB_API_BASE_URL,
    GitHubConnector,
    GitHubConnectorConfig,
    register_github_connector,
)
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry


class FakeGitHubClient:
    def __init__(self, response=None, error=None):
        self.response = response if response is not None else {"ok": True}
        self.error = error
        self.calls = []

    def request(self, path, *, token, query=None):
        self.calls.append({"path": path, "token": token, "query": query})
        if self.error:
            raise self.error
        return self.response


class GitHubConnectorTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = GitHubConnectorConfig()
        self.client = FakeGitHubClient()
        self.connector = GitHubConnector(self.config, self.client)
        self.credentials = {"token": "fake-github-token"}

    async def test_authenticated_user(self):
        result = await self.connector.execute(
            ConnectorRequest("get_authenticated_user", {}), self.credentials
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["path"], "/user")

    async def test_list_repositories_query(self):
        result = await self.connector.execute(
            ConnectorRequest("list_repositories", {"sort": "updated", "per_page": 20}),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["query"], {"sort": "updated", "per_page": 20}
        )

    async def test_get_repository_fixed_path(self):
        result = await self.connector.execute(
            ConnectorRequest("get_repository", {"owner": "octocat", "repo": "hello-world"}),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["path"], "/repos/octocat/hello-world"
        )

    async def test_list_issues(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "list_issues",
                {"owner": "octocat", "repo": "hello-world", "state": "closed"},
            ),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["path"], "/repos/octocat/hello-world/issues"
        )
        self.assertEqual(self.client.calls[0]["query"], {"state": "closed"})

    async def test_get_file_contents_encodes_segments(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "get_file_contents",
                {"owner": "octocat", "repo": "hello-world", "path": "docs/hello world.md", "ref": "main"},
            ),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["path"],
            "/repos/octocat/hello-world/contents/docs/hello%20world.md",
        )
        self.assertEqual(self.client.calls[0]["query"], {"ref": "main"})

    async def test_missing_token_fails_without_request(self):
        result = await self.connector.execute(
            ConnectorRequest("get_authenticated_user", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation_is_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_repository", {"owner": "octocat", "repo": "hello-world"}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_owner(self):
        result = await self.connector.execute(
            ConnectorRequest("get_repository", {"owner": "../octocat", "repo": "repo"}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_path_traversal(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "get_file_contents",
                {"owner": "octocat", "repo": "repo", "path": "docs/../secrets.txt"},
            ),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_per_page(self):
        result = await self.connector.execute(
            ConnectorRequest("list_repositories", {"per_page": 500}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_transport_error_does_not_leak_token(self):
        client = FakeGitHubClient(error=RuntimeError("fake-github-token"))
        connector = GitHubConnector(self.config, client)
        result = await connector.execute(
            ConnectorRequest("get_authenticated_user", {}), self.credentials
        )
        self.assertFalse(result.success)
        self.assertNotIn("fake-github-token", result.error)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_github_connector(registry, self.config, self.client)
        self.assertIs(registry.get("github"), connector)

    async def test_api_host_is_fixed(self):
        self.assertEqual(self.config.transport.base_url, GITHUB_API_BASE_URL)
        self.assertEqual(
            tuple(self.config.transport.allowed_hosts), ("api.github.com",)
        )


if __name__ == "__main__":
    unittest.main()
