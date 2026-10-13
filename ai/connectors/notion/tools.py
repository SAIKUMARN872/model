"""Convenience helpers for registering the Notion connector."""
from __future__ import annotations

import os
from typing import Any

from ai.connectors.registry import ConnectorRegistry
from .client import NotionClient
from .config import NotionConfig, default_config
from .connector import NotionConnector


def create_notion_client(
    config: NotionConfig | None = None,
    http_client: Any = None,
) -> NotionClient:
    return NotionClient(config=config or default_config(), http_client=http_client)


def register_notion_connector(
    registry: ConnectorRegistry,
    *,
    config: NotionConfig | None = None,
    client: NotionClient | None = None,
) -> NotionConnector:
    """Register and return a Notion connector instance."""
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry.")
    connector = NotionConnector(client=client or create_notion_client(config))
    registry.register(connector)
    return connector


def notion_credentials(config: NotionConfig | None = None) -> dict[str, str]:
    """Load the configured token for explicit local setup."""
    selected = config or default_config()
    token = os.environ.get(selected.credential_env_var, "")
    return {"access_token": token} if token else {}
