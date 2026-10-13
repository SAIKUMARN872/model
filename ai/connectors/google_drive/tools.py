"""Google Drive connector construction helpers."""
from ai.connectors.google_drive.client import GoogleDriveClient
from ai.connectors.google_drive.config import default_config

def create_google_drive_client(config=None) -> GoogleDriveClient:
    return GoogleDriveClient(config or default_config())
