"""HubSpot API client using ModelNow's shared HTTPS transport."""

from ai.connectors.client import ConnectorHTTPClient


class HubSpotClient:
    def __init__(self, http_client: ConnectorHTTPClient) -> None:
        self._http = http_client

    def request(self, method, path, *, token, query=None, json_body=None):
        return self._http.request(
            method,
            path,
            query=query,
            json_body=json_body,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )
