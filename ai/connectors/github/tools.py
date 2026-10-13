"""GitHub client factory."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.github.client import GitHubClient
from ai.connectors.github.config import GitHubConnectorConfig


def create_github_client(config=None):
    config = config or GitHubConnectorConfig()
    return GitHubClient(ConnectorHTTPClient(config.transport))
