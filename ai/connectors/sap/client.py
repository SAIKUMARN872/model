"""SAP OData HTTP client using ModelNow's shared HTTPS client."""
from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.config import ConnectorConfig
from ai.connectors.exceptions import ConnectorAuthenticationError


class SAPClient:
    def __init__(self, config):
        from .config import SAPConfig

        if not isinstance(config, SAPConfig):
            raise TypeError("config must be SAPConfig")
        self.config = config
        self.http = ConnectorHTTPClient(
            ConnectorConfig(
                base_url=config.service_url,
                timeout_seconds=config.timeout_seconds,
                allowed_hosts=config.allowed_hosts,
            )
        )

    def get(self, path, *, query=None, access_token=None):
        if not access_token:
            raise ConnectorAuthenticationError("SAP access token is missing.")
        return self.http.request(
            "GET",
            path,
            query=query,
            headers={"Authorization": f"Bearer {access_token}"},
        )
