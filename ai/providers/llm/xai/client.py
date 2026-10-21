from __future__ import annotations

import json
from typing import Any

try:
    import httpx
except ImportError:
    httpx = None

from .config import XAIConfig


class XAIClient:
    def __init__(self, config: XAIConfig):
        self.config = config
        self._client = None

    async def initialize(self) -> None:
        if httpx is None:
            raise RuntimeError("httpx is required for the xAI provider")

        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(
                    self.config.timeout_seconds,
                    connect=self.config.connect_timeout_seconds,
                ),
                headers=self.config.auth_headers(),
            )

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def request(
        self,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        await self.initialize()

        response = await self._client.post(
            self.config.chat_url,
            json=payload,
        )

        response.raise_for_status()
        return response.json()

    async def stream_request(
        self,
        payload: dict[str, Any],
    ):
        await self.initialize()

        async with self._client.stream(
            "POST",
            self.config.chat_url,
            json=payload,
        ) as response:
            response.raise_for_status()

            async for line in response.aiter_lines():
                yield line

    async def list_models(self) -> list[dict[str, Any]]:
        await self.initialize()

        response = await self._client.get(self.config.models_url)
        response.raise_for_status()

        data = response.json()

        if isinstance(data, dict):
            models = data.get("data", data.get("models", []))
            if isinstance(models, list):
                return models

        return []

    @staticmethod
    def encode_json(data: Any) -> str:
        return json.dumps(data, ensure_ascii=False)
