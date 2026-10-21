"""Configuration for the read-only Notion connector."""
from __future__ import annotations

from dataclasses import dataclass
import re

from ai.connectors.config import ConnectorConfig

NOTION_API_BASE_URL = "https://api.notion.com/v1"
NOTION_ALLOWED_HOSTS = ("api.notion.com",)
NOTION_CREDENTIAL_ENV = "NOTION_ACCESS_TOKEN"
NOTION_API_VERSION = "2025-09-03"
NOTION_REQUIRED_PERMISSIONS = ("notion:read",)


@dataclass(frozen=True)
class NotionConfig:
    api_version: str = NOTION_API_VERSION
    credential_env_var: str = NOTION_CREDENTIAL_ENV
    timeout_seconds: float = 15.0

    def __post_init__(self) -> None:
        if not isinstance(self.api_version, str) or not re.fullmatch(
            r"\d{4}-\d{2}-\d{2}", self.api_version
        ):
            raise ValueError("Notion API version must use YYYY-MM-DD format.")
        if not isinstance(self.credential_env_var, str) or not re.fullmatch(
            r"[A-Z_][A-Z0-9_]*", self.credential_env_var
        ):
            raise ValueError("Invalid Notion credential environment variable.")
        if isinstance(self.timeout_seconds, bool) or not isinstance(
            self.timeout_seconds, (int, float)
        ) or not 0 < self.timeout_seconds <= 120:
            raise ValueError("timeout_seconds must be between 0 and 120.")

    def http_config(self) -> ConnectorConfig:
        return ConnectorConfig(
            base_url=NOTION_API_BASE_URL,
            timeout_seconds=float(self.timeout_seconds),
            credential_env_vars={"access_token": self.credential_env_var},
            allowed_hosts=NOTION_ALLOWED_HOSTS,
        )


def default_config() -> NotionConfig:
    return NotionConfig()
