"""Linear GraphQL client using the shared safe HTTP client."""

from ai.connectors.client import ConnectorHTTPClient


class LinearClient:
    def __init__(self, http_client: ConnectorHTTPClient):
        self._http = http_client

    def execute(self, query, variables, *, token):
        return self._http.request(
            "POST",
            "/graphql",
            headers={
                "Authorization": token,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json_body={"query": query, "variables": variables},
        )
