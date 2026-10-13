"""REST transport adapter using the shared allowlisted HTTPS client."""
from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.config import ConnectorConfig


class RESTAPIClient:
    def __init__(self, config):
        if not isinstance(config, RESTAPIConfigPlaceholder):
            # Avoid accepting arbitrary objects with an unvalidated base URL.
            raise TypeError("Use RESTAPIClient.from_config(config).")

    @classmethod
    def from_config(cls, config):
        from .config import RESTAPIConfig

        if not isinstance(config, RESTAPIConfig):
            raise TypeError("config must be RESTAPIConfig")
        instance = cls.__new__(cls)
        instance.config = config
        instance.http = ConnectorHTTPClient(
            ConnectorConfig(
                base_url=config.base_url,
                timeout_seconds=config.timeout_seconds,
                credential_env_vars={},
                allowed_hosts=config.allowed_hosts,
            )
        )
        return instance

    def request(self, operation, *, query=None, body=None, access_token=None):
        headers = {}
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"
        return self.http.request(
            operation.method,
            operation.path,
            query=query,
            json_body=body,
            headers=headers,
        )


# This private sentinel prevents accidental construction without validated config.
class RESTAPIConfigPlaceholder:
    pass
