"""GitHub REST API client using the shared HTTPS transport."""

from ai.connectors.client import ConnectorHTTPClient


class GitHubClient:
    def __init__(self, http_client: ConnectorHTTPClient) -> None:
        self._http = http_client

    def request(self, path, *, token, query=None):
        return self._http.request(
            "GET",
            path,
            query=query,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        )
