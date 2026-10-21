import unittest

from ai.connectors.gitlab import (
    GITLAB_API_BASE_URL,
    GitLabConnector,
    GitLabConnectorConfig,
    register_gitlab_connector,
)
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry


class FakeGitLabClient:
    def __init__(self, response=None, error=None):
        self.response = response if response is not None else {"ok": True}
        self.error = error
        self.calls = []

    def request(self, path, *, token, query=None):
        self.calls.append({"path": path, "token": token, "query": query})
        if self.error:
            raise self.error
        return self.response


class GitLabConnectorTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = GitLabConnectorConfig()
        self.client = FakeGitLabClient()
        self.connector = GitLabConnector(self.config, self.client)
        self.credentials = {"token": "fake-gitlab-token"}

    async def test_get_current_user(self):
        result = await self.connector.execute(
            ConnectorRequest("get_current_user", {}), self.credentials
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["path"], "/user")

    async def test_list_projects_query(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "list_projects",
                {"membership": True, "order_by": "updated_at", "per_page": 20},
            ),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["query"],
            {"membership": True, "order_by": "updated_at", "per_page": 20},
        )

    async def test_get_project(self):
        result = await self.connector.execute(
            ConnectorRequest("get_project", {"project_id": "12345"}),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["path"], "/projects/12345")

    async def test_list_issues(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "list_issues",
                {"project_id": 12345, "state": "opened", "per_page": 10},
            ),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["path"], "/projects/12345/issues")
        self.assertEqual(
            self.client.calls[0]["query"], {"state": "opened", "per_page": 10}
        )

    async def test_missing_token_fails_without_request(self):
        result = await self.connector.execute(
            ConnectorRequest("get_current_user", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation_is_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_project", {"project_id": "12345"}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_project_id(self):
        result = await self.connector.execute(
            ConnectorRequest("get_project", {"project_id": "../12345"}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_pagination(self):
        result = await self.connector.execute(
            ConnectorRequest("list_projects", {"per_page": 500}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_boolean(self):
        result = await self.connector.execute(
            ConnectorRequest("list_projects", {"membership": "yes"}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_transport_error_does_not_leak_token(self):
        client = FakeGitLabClient(error=RuntimeError("fake-gitlab-token"))
        connector = GitLabConnector(self.config, client)
        result = await connector.execute(
            ConnectorRequest("get_current_user", {}), self.credentials
        )
        self.assertFalse(result.success)
        self.assertNotIn("fake-gitlab-token", result.error)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_gitlab_connector(registry, self.config, self.client)
        self.assertIs(registry.get("gitlab"), connector)

    async def test_api_host_is_fixed(self):
        self.assertEqual(self.config.transport.base_url, GITLAB_API_BASE_URL)
        self.assertEqual(
            tuple(self.config.transport.allowed_hosts), ("gitlab.com",)
        )

if __name__ == "__main__":
    unittest.main()
