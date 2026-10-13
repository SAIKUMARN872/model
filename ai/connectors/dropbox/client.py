"""Dropbox API v2 HTTP client adapter."""

from ai.connectors.client import ConnectorHTTPClient


class DropboxClient:
    def __init__(self, http_client: ConnectorHTTPClient) -> None:
        self._http = http_client

    def request(self, path, *, token, body):
        return self._http.request(
            "POST",
            path,
            json_body=body,
            headers={"Authorization": f"Bearer {token}"},
        )
