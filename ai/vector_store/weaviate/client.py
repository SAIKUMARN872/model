"""Client lifecycle wrapper for Weaviate Cloud and local instances."""

from __future__ import annotations

import os
from typing import Any


class WeaviateClient:
    def __init__(
        self,
        url: str | None = None,
        api_key: str | None = None,
        client: Any | None = None,
        timeout: int = 10,
    ) -> None:
        if isinstance(timeout, bool) or not isinstance(timeout, int) or timeout < 1:
            raise ValueError("timeout must be a positive integer")

        self.url = (url or os.getenv("WEAVIATE_URL", "")).strip()
        self.api_key = api_key or os.getenv("WEAVIATE_API_KEY")
        self.timeout = timeout
        self._client = client
        self._owns_client = client is None

    @property
    def initialized(self) -> bool:
        return self._client is not None

    @property
    def raw_client(self) -> Any:
        if self._client is None:
            raise RuntimeError("Weaviate is not connected; call connect() first")
        return self._client

    def connect(self) -> Any:
        if self._client is not None:
            return self._client

        try:
            import weaviate
        except ImportError as exc:
            raise RuntimeError(
                "Install Weaviate with: pip install weaviate-client"
            ) from exc

        if self.api_key:
            if not self.url:
                raise ValueError(
                    "WEAVIATE_URL is required when using an API key"
                )

            try:
                from weaviate.classes.init import Auth
            except ImportError as exc:
                raise RuntimeError(
                    "The installed Weaviate client does not expose classes.init.Auth"
                ) from exc

            self._client = weaviate.connect_to_weaviate_cloud(
                cluster_url=self.url,
                auth_credentials=Auth.api_key(self.api_key),
                additional_config=weaviate.classes.init.AdditionalConfig(
                    timeout=weaviate.classes.init.Timeout(
                        init=self.timeout,
                        query=self.timeout,
                        insert=self.timeout,
                    )
                ),
            )
        else:
            self._client = weaviate.connect_to_local()

        return self._client

    def is_ready(self) -> bool:
        if self._client is None:
            return False
        check = getattr(self._client, "is_ready", None)
        return bool(check()) if callable(check) else True

    def close(self) -> None:
        if self._client is not None and self._owns_client:
            close = getattr(self._client, "close", None)
            if callable(close):
                close()
            self._client = None
