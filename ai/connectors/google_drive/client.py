"""Google Drive v3 HTTP client."""
from typing import Any, Mapping

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.config import ConnectorConfig


class GoogleDriveClient:
    def __init__(self, config: ConnectorConfig | None = None) -> None:
        self.config = config or ConnectorConfig(
            base_url="https://www.googleapis.com/drive/v3",
            allowed_hosts=("www.googleapis.com",),
        )
        self._http = ConnectorHTTPClient(self.config)

    def request(
        self,
        path: str,
        *,
        access_token: str,
        query: Mapping[str, Any] | None = None,
    ) -> Any:
        if not access_token or not access_token.strip():
            raise ValueError("A Google Drive access token is required.")
        if not path.startswith("/") or path.startswith("//") or ".." in path.split("/"):
            raise ValueError("Invalid Google Drive API path.")

        return self._http.request(
            "GET",
            path,
            headers={"Authorization": f"Bearer {access_token}"},
            query=dict(query or {}),
        )
