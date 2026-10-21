"""Redis connector registration helpers."""
from ai.connectors.registry import ConnectorRegistry
from .client import RedisClient
from .config import create_redis_config
from .connector import RedisConnector


def register_redis_connector(registry, config, *, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    actual_client = client or RedisClient.from_environment(config)
    connector = RedisConnector(config, actual_client)
    registry.register(connector)
    return connector


__all__ = ["register_redis_connector", "create_redis_config", "RedisClient"]
