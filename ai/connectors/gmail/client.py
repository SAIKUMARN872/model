"""Gmail API client using the shared HTTPS transport."""

from ai.connectors.client import ConnectorHTTPClient


class GmailClient:
    def __init__(self, http_client: ConnectorHTTPClient) -> None:
        self._http = http_client

    def request(self, path, *, access_token, query=None):
        return self._http.request(
            "GET",
            path,
            query=query,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )
