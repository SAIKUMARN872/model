"""REST API connector registration helpers."""
from ai.connectors.registry import ConnectorRegistry
from .config import create_rest_api_config, RESTAPIOperationConfig
from .connector import RESTAPIConnector


def register_rest_api_connector(registry, config, *, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    connector = RESTAPIConnector(config, client=client)
    registry.register(connector)
    return connector


__all__ = [
    "register_rest_api_connector",
    "create_rest_api_config",
    "RESTAPIOperationConfig",
]
