"""Discord API client using the shared secure HTTP transport."""

from ai.connectors.client import ConnectorHTTPClient


class DiscordClient:
    def __init__(self, http_client: ConnectorHTTPClient) -> None:
        self._http = http_client

    def request(self, method, path, *, query=None, json_body=None, token=None):
        headers = {}
        if token:
            headers["Authorization"] = f"Bot {token}"
        return self._http.request(
            method,
            path,
            query=query,
            json_body=json_body,
            headers=headers,
        )
