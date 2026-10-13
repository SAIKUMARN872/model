"""Salesforce REST API client using the shared HTTPS transport."""
from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.config import ConnectorConfig


class SalesforceClient:
    def __init__(self, config):
        from .config import SalesforceConfig

        if not isinstance(config, SalesforceConfig):
            raise TypeError("config must be SalesforceConfig")
        self.config = config
        self.http = ConnectorHTTPClient(
            ConnectorConfig(
                base_url=(
                    config.instance_url.rstrip("/")
                    + "/services/data/"
                    + config.api_version
                ),
                timeout_seconds=config.timeout_seconds,
                allowed_hosts=config.allowed_hosts,
            )
        )

    def request(self, method, path, *, query=None, access_token=None):
        if not access_token:
            from ai.connectors.exceptions import ConnectorAuthenticationError
            raise ConnectorAuthenticationError("Salesforce access token is missing.")
        return self.http.request(
            method,
            path,
            query=query,
            headers={"Authorization": f"Bearer {access_token}"},
        )
