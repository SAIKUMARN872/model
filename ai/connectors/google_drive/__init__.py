"""Google Drive connector public API."""
from ai.connectors.google_drive.client import GoogleDriveClient
from ai.connectors.google_drive.config import default_config
from ai.connectors.google_drive.connector import GoogleDriveConnector
from ai.connectors.google_drive.tools import create_google_drive_client

def register_google_drive_connector(registry, config=None, client=None):
    connector = GoogleDriveConnector(
        client=client or GoogleDriveClient(config or default_config())
    )
    registry.register(connector)
    return connector

__all__ = [
    "GoogleDriveClient",
    "GoogleDriveConnector",
    "create_google_drive_client",
    "register_google_drive_connector",
]
