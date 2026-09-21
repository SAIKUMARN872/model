Set-Content ".\ai\providers\llm\anthropic\client.py" @'
from __future__ import annotations

from typing import Any

from anthropic import AsyncAnthropic

from ai.providers.base.client import BaseClient
from ai.providers.base.config import ProviderConfig

from .config import AnthropicConfig


class AnthropicClient(BaseClient):
    def __init__(
        self,
        config: ProviderConfig,
        anthropic_config: AnthropicConfig | None = None,
    ):
        super().__init__(config)

        self.anthropic_config = (
            anthropic_config
            or AnthropicConfig.from_env()
        )

        self._client: AsyncAnthropic | None = None

    @property
    def raw_client(self) -> AsyncAnthropic:
        if self._client is None:
            self._client = AsyncAnthropic(
                **self.anthropic_config.client_kwargs()
            )

        return self._client

    async def request(
        self,
        *,
        method: str,
        path: str,
        headers: dict[str, str] | None = None,
        json: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> Any:
        method = method.upper()

        if method != "POST":
            raise ValueError(
                f"AnthropicClient only supports POST, got {method}"
            )

        if path != "/messages":
            raise ValueError(
                f"Unsupported Anthropic path: {path}"
            )

        payload = dict(json or {})

        return await self.raw_client.messages.create(
            **payload
        )

    def stream_request(
        self,
        *,
        json: dict[str, Any],
    ):
        return self.raw_client.messages.stream(
            **dict(json)
        )

    async def close(self):
        if self._client is not None:
            await self._client.close()
            self._client = None

        await super().close()


__all__ = ["AnthropicClient"]
'@