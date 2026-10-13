"""Configuration for the read-only Google Drive connector."""
from ai.connectors.config import ConnectorConfig

GOOGLE_DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3"
GOOGLE_DRIVE_ALLOWED_HOSTS = ("www.googleapis.com",)
GOOGLE_DRIVE_CREDENTIAL_ENV = "GOOGLE_DRIVE_ACCESS_TOKEN"
GOOGLE_DRIVE_REQUIRED_PERMISSIONS = ("google_drive:read",)

def default_config() -> ConnectorConfig:
    return ConnectorConfig(
        base_url=GOOGLE_DRIVE_API_BASE_URL,
        allowed_hosts=GOOGLE_DRIVE_ALLOWED_HOSTS,
        credential_env_vars={"access_token": GOOGLE_DRIVE_CREDENTIAL_ENV},
    )
