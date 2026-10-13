"""Slack Web API client."""
from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.config import ConnectorConfig
from ai.connectors.exceptions import ConnectorAuthenticationError


class SlackClient:
    def __init__(self, config):
        from .config import SlackConfig
        if not isinstance(config, SlackConfig):
            raise TypeError("config must be SlackConfig")
        self.config = config
        self.http = ConnectorHTTPClient(ConnectorConfig(
            base_url="https://slack.com/api",
            timeout_seconds=config.timeout_seconds,
            allowed_hosts=("slack.com",),
        ))

    def call(self, method, *, query=None, access_token=None):
        if not access_token:
            raise ConnectorAuthenticationError("Slack access token is missing.")
        data = self.http.request(
            "GET",
            method,
            query=query or {},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if not isinstance(data, dict):
            raise ValueError("Unexpected Slack API response.")
        if data.get("ok") is not True:
            # Do not expose tokens or raw response bodies.
            error = data.get("error", "request_failed")
            if not isinstance(error, str) or not error.replace("_", "").isalnum():
                error = "request_failed"
            from ai.connectors.exceptions import ConnectorRequestError
            raise ConnectorRequestError(f"Slack API error: {error}")
        return data
