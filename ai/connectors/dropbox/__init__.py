"""Dropbox connector public API."""

from ai.connectors.dropbox.client import DropboxClient
from ai.connectors.dropbox.config import (
    DROPBOX_ALLOWED_HOSTS,
    DROPBOX_API_BASE_URL,
    DropboxConnectorConfig,
)
from ai.connectors.dropbox.connector import DropboxConnector
from ai.connectors.dropbox.models import DropboxOperation
from ai.connectors.dropbox.schemas import (
    build_dropbox_metadata,
    build_dropbox_operations,
    validate_dropbox_arguments,
)
from ai.connectors.dropbox.tools import create_dropbox_client


def register_dropbox_connector(registry, config=None, client=None):
    config = config or DropboxConnectorConfig()
    client = client or create_dropbox_client(config)
    connector = DropboxConnector(config, client)
    registry.register(connector)
    return connector


__all__ = [
    "DROPBOX_ALLOWED_HOSTS",
    "DROPBOX_API_BASE_URL",
    "DropboxClient",
    "DropboxConnector",
    "DropboxConnectorConfig",
    "DropboxOperation",
    "build_dropbox_metadata",
    "build_dropbox_operations",
    "create_dropbox_client",
    "register_dropbox_connector",
    "validate_dropbox_arguments",
]
