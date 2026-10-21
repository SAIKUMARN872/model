"""Zoho HTTP transport adapter."""
from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.config import ConnectorConfig
from ai.connectors.exceptions import ConnectorAuthenticationError, ConnectorRequestError


class ZohoClient:
    def __init__(self, config, http_client=None):
        self.config = config
        if http_client is None:
            http_client = ConnectorHTTPClient(ConnectorConfig(
                base_url=config.base_url,
                timeout_seconds=config.timeout_seconds,
                credential_env_vars={"token": config.credential_env_var},
                allowed_hosts=config.allowed_hosts,
            ))
        self._http = http_client

    def request(self, path, *, token, query=None):
        if not isinstance(token, str) or not token.strip():
            raise ConnectorAuthenticationError("Zoho access token is missing.")
        data = self._http.request(
            "GET",
            path.lstrip("/"),
            query=query,
            headers={
                "Authorization": f"Zoho-oauthtoken {token}",
                "Accept": "application/json",
            },
        )
        if not isinstance(data, dict):
            raise ConnectorRequestError("Zoho returned an unexpected response.")
        if data.get("code") not in (None, "SUCCESS"):
            code = data.get("code")
            if not isinstance(code, str) or not code.replace("_", "").isalnum():
                code = "API_ERROR"
            raise ConnectorRequestError(f"Zoho API error: {code}")
        return data
