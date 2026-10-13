"""MySQL connector registration helpers."""

from ai.connectors.mysql.client import MySQLClient
from ai.connectors.mysql.config import create_mysql_config
from ai.connectors.mysql.connector import MySQLConnector
from ai.connectors.registry import ConnectorRegistry


def register_mysql_connector(registry, config, *, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    actual_client = client or MySQLClient.from_environment(config)
    connector = MySQLConnector(config, actual_client)
    registry.register(connector)
    return connector


__all__ = ["register_mysql_connector", "create_mysql_config", "MySQLClient"]
