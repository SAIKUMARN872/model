from __future__ import annotations

import os
from dataclasses import dataclass

from ai.providers.base.config import ProviderConfig


@dataclass(frozen=True)
class MistralConfig:
    provider_id: str = "mistral"
    api_key: str | None = None
    base_url: str = "https://api.mistral.ai"
    timeout_seconds: float = 60.0
    max_retries: int = 3

    @classmethod
    def from_env(cls) -> "MistralConfig":
        return cls(
            api_key=os.getenv("MISTRAL_API_KEY"),
            base_url=os.getenv("MISTRAL_BASE_URL", "https://api.mistral.ai"),
            timeout_seconds=float(os.getenv("MISTRAL_TIMEOUT_SECONDS", "60")),
            max_retries=int(os.getenv("MISTRAL_MAX_RETRIES", "3")),
        )

    def client_kwargs(self) -> dict[str, object]:
        return {
            "api_key": self.api_key,
            "server_url": self.base_url,
            "timeout_ms": int(self.timeout_seconds * 1000),
        }

    def provider_config(self) -> ProviderConfig:
        return ProviderConfig(
            provider_id=self.provider_id,
            api_key=self.api_key,
            base_url=self.base_url,
            timeout_seconds=self.timeout_seconds,
            max_retries=self.max_retries,
        )
