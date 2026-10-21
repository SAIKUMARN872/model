"""PostgreSQL connector registration helpers."""
from ai.connectors.registry import ConnectorRegistry
from .client import PostgreSQLClient
from .config import create_postgres_config
from .connector import PostgreSQLConnector


def register_postgres_connector(registry, config, *, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    actual_client = client or PostgreSQLClient.from_environment(config)
    connector = PostgreSQLConnector(config, actual_client)
    registry.register(connector)
    return connector


__all__ = [
    "register_postgres_connector",
    "create_postgres_config",
    "PostgreSQLClient",
]
