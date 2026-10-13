"""HTTP adapter for configured Workday REST endpoints."""
from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.config import ConnectorConfig
from ai.connectors.exceptions import ConnectorConfigurationError


class WorkdayClient:
    def __init__(self, config):
        from .config import WorkdayConfig
        if not isinstance(config, WorkdayConfig):
            raise TypeError("config must be WorkdayConfig")
        self.config = config
        self.http = ConnectorHTTPClient(ConnectorConfig(
            base_url=config.base_url,
            timeout_seconds=config.timeout_seconds,
            allowed_hosts=config.allowed_hosts,
        ))

    def get(self, path, *, query=None, access_token=None):
        if not access_token or not isinstance(access_token, str):
            from ai.connectors.exceptions import ConnectorAuthenticationError
            raise ConnectorAuthenticationError("Workday access token is missing.")
        if not isinstance(path, str) or not path.startswith("/") or path.startswith("//"):
            raise ConnectorConfigurationError("Invalid configured Workday path.")
        return self.http.request(
            "GET",
            path.lstrip("/"),
            query=query or {},
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
        )
