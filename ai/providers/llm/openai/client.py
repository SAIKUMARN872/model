from __future__ import annotations

from typing import Any

from openai import AsyncOpenAI

from ...base.client import BaseClient
from ...base.config import ProviderConfig

from .config import OpenAIConfig


class OpenAIClient(BaseClient):
    """Async OpenAI client adapter for ModelNow."""

    def __init__(
        self,
        config: ProviderConfig,
        openai_config: OpenAIConfig | None = None,
    ) -> None:
        super().__init__(config)

        self.openai_config = (
            openai_config or OpenAIConfig.from_env()
        )

        self._client: AsyncOpenAI | None = None

    @property
    def raw_client(self) -> AsyncOpenAI:
        """Lazily create the OpenAI SDK client."""

        if self._client is None:
            self._client = AsyncOpenAI(
                **self.openai_config.client_kwargs()
            )

        return self._client

    def _require_client(self) -> AsyncOpenAI:
        """Create the SDK client when an actual API call is required."""

        return self.raw_client

    async def request(
        self,
        *,
        method: str,
        path: str,
        headers: dict[str, str] | None = None,
        json: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> Any:
        """Execute a request through the OpenAI SDK."""

        method = method.upper()

        if method != "POST":
            raise ValueError(
                f"Unsupported OpenAI client method: {method}"
            )

        if path != "/responses":
            raise ValueError(
                f"Unsupported OpenAI API path: {path}"
            )

        payload = dict(json or {})

        return await self._require_client().responses.create(
            **payload
        )

    async def close(self) -> None:
        """Close the underlying OpenAI HTTP client."""

        if self._client is not None:
            await self._client.close()
            self._client = None

        await super().close()


__all__ = ["OpenAIClient"]



