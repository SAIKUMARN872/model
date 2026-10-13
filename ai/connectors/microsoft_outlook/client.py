"""Microsoft Graph HTTP client."""

from ai.connectors.client import ConnectorHTTPClient


class MicrosoftOutlookClient:
    def __init__(self, http_client: ConnectorHTTPClient):
        self._http = http_client

    def request(self, method, path, *, token, query=None):
        return self._http.request(
            method,
            path,
            query=query,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
        )
