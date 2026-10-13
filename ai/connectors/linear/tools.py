"""Linear connector construction and registration."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.linear.client import LinearClient
from ai.connectors.linear.config import LinearConnectorConfig, create_linear_config
from ai.connectors.linear.connector import LinearConnector


def create_linear_client(config):
    return LinearClient(ConnectorHTTPClient(config.transport))


def register_linear_connector(registry, config=None, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    config = config or create_linear_config()
    connector = LinearConnector(config, client or create_linear_client(config))
    registry.register(connector)
    return connector
