from __future__ import annotations

from typing import Any

from openai import AsyncOpenAI

from ...base.client import BaseClient
from ...base.config import ProviderConfig

from .config import DeepSeekConfig


class DeepSeekClient(BaseClient):
    """Async DeepSeek client using the OpenAI-compatible API."""

    def __init__(
        self,
        config: ProviderConfig,
        deepseek_config: DeepSeekConfig | None = None,
    ) -> None:
        super().__init__(config)
        self.deepseek_config = (
            deepseek_config or DeepSeekConfig.from_env()
        )
        self._client: AsyncOpenAI | None = None

    @property
    def raw_client(self) -> AsyncOpenAI:
        if self._client is None:
            self._client = AsyncOpenAI(
                **self.deepseek_config.client_kwargs()
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
        if method.upper() != "POST":
            raise ValueError(
                f"Unsupported DeepSeek client method: {method}"
            )

        if path != "/chat/completions":
            raise ValueError(
                f"Unsupported DeepSeek API path: {path}"
            )

        payload = dict(json or {})

        return await self.raw_client.chat.completions.create(
            **payload
        )

    async def stream_request(
        self,
        *,
        json: dict[str, Any],
    ) -> Any:
        payload = dict(json)
        payload["stream"] = True

        return await self.raw_client.chat.completions.create(
            **payload
        )

    async def close(self) -> None:
        if self._client is not None:
            await self._client.close()
            self._client = None

        await super().close()


__all__ = ["DeepSeekClient"]
