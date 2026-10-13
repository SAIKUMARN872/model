"""GitLab REST API v4 client using the shared HTTPS transport."""

from ai.connectors.client import ConnectorHTTPClient


class GitLabClient:
    def __init__(self, http_client: ConnectorHTTPClient) -> None:
        self._http = http_client

    def request(self, path, *, token, query=None):
        return self._http.request(
            "GET",
            path,
            query=query,
            headers={
                "PRIVATE-TOKEN": token,
                "Accept": "application/json",
            },
        )
