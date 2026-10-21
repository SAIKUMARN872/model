from __future__ import annotations

from mistralai.client import Mistral

from ai.providers.base.client import BaseClient
from ai.providers.base.config import ProviderConfig

from .config import MistralConfig


class MistralClient(BaseClient):
    def __init__(
        self,
        config: ProviderConfig,
        mistral_config: MistralConfig,
    ) -> None:
        self.config = config
        self.mistral_config = mistral_config
        self._client: Mistral | None = None

    @property
    def raw_client(self) -> Mistral:
        if self._client is None:
            kwargs = self.mistral_config.client_kwargs()
            kwargs = {
                key: value
                for key, value in kwargs.items()
                if value is not None
            }
            self._client = Mistral(**kwargs)
        return self._client

    async def request(
        self,
        method: str,
        path: str,
        headers: dict[str, str] | None = None,
        json: dict | None = None,
        params: dict | None = None,
    ):
        raise NotImplementedError(
            "Mistral provider uses the official SDK chat interface."
        )

    async def close(self) -> None:
        self._client = None
