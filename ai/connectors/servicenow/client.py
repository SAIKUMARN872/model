"""ServiceNow Table API client using the shared HTTPS transport."""
from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.config import ConnectorConfig
from ai.connectors.exceptions import ConnectorAuthenticationError


class ServiceNowClient:
    def __init__(self, config):
        from .config import ServiceNowConfig

        if not isinstance(config, ServiceNowConfig):
            raise TypeError("config must be ServiceNowConfig")
        self.config = config
        self.http = ConnectorHTTPClient(
            ConnectorConfig(
                base_url=config.instance_url.rstrip("/") + "/api/now",
                timeout_seconds=config.timeout_seconds,
                allowed_hosts=config.allowed_hosts,
            )
        )

    def get(self, path, *, query=None, access_token=None):
        if not access_token:
            raise ConnectorAuthenticationError("ServiceNow access token is missing.")
        return self.http.request(
            "GET",
            path,
            query=query,
            headers={"Authorization": f"Bearer {access_token}"},
        )
