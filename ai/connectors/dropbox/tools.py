"""Dropbox connector factory."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.dropbox.client import DropboxClient
from ai.connectors.dropbox.config import DropboxConnectorConfig


def create_dropbox_client(config=None):
    config = config or DropboxConnectorConfig()
    return DropboxClient(ConnectorHTTPClient(config.transport))
