"""Register the generic Zoho connector."""
from .connector import ZohoConnector


def register_zoho_connector(registry, config, client=None):
    """Build and register a configured Zoho connector."""
    connector = ZohoConnector(config, client=client)
    registry.register(connector)
    return connector
