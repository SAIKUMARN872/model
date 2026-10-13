"""GitLab client factory."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.gitlab.client import GitLabClient
from ai.connectors.gitlab.config import GitLabConnectorConfig


def create_gitlab_client(config=None):
    config = config or GitLabConnectorConfig()
    return GitLabClient(ConnectorHTTPClient(config.transport))
