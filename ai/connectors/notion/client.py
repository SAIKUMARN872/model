"""Allowlisted HTTPS client for the Notion API."""
from __future__ import annotations

from typing import Any, Mapping

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.exceptions import ConnectorAuthenticationError
from .config import NotionConfig, default_config


class NotionClient:
    """Thin authenticated client. Redirects are disabled by the shared HTTP client."""

    def __init__(
        self,
        config: NotionConfig | None = None,
        http_client: ConnectorHTTPClient | None = None,
    ) -> None:
        self.config = config or default_config()
        self.http_client = http_client or ConnectorHTTPClient(self.config.http_config())

    def request(
        self,
        path: str,
        *,
        access_token: str,
        method: str = "GET",
        query: Mapping[str, Any] | None = None,
        body: Any = None,
    ) -> Any:
        if not isinstance(access_token, str) or not access_token.strip():
            raise ConnectorAuthenticationError("Notion access token is missing.")
        if not isinstance(path, str) or not path.startswith("/"):
            raise ValueError("A relative Notion API path is required.")
        return self.http_client.request(
            method,
            path,
            query=query,
            json_body=body,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Notion-Version": self.config.api_version,
            },
        )
