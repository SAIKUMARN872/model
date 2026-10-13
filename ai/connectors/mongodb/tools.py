"""MongoDB connector registration helpers."""

import os

from ai.connectors.exceptions import ConnectorAuthenticationError
from ai.connectors.mongodb.client import MongoDBClient
from ai.connectors.mongodb.config import create_mongodb_config
from ai.connectors.mongodb.connector import MongoDBConnector
from ai.connectors.registry import ConnectorRegistry


def create_mongodb_client(config, credentials=None):
    credentials = credentials or {}
    uri = credentials.get("uri") or os.getenv(config.uri_env_var)
    if not uri:
        raise ConnectorAuthenticationError(
            f"Missing MongoDB URI environment variable: {config.uri_env_var}"
        )
    return MongoDBClient(
        uri,
        config.database,
        timeout_seconds=config.timeout_seconds,
    )


def register_mongodb_connector(registry, config, *, credentials=None, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    actual_client = client or create_mongodb_client(config, credentials)
    connector = MongoDBConnector(config, actual_client)
    registry.register(connector)
    return connector
