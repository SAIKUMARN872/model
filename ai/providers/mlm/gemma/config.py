from __future__ import annotations

import os
from dataclasses import dataclass

from ...base.config import ProviderConfig


@dataclass(frozen=True)
class GemmaConfig:
    provider_id: str = "gemma"
    model_id: str = "google/gemma-3-4b-it"
    base_url: str | None = None
    api_key: str | None = None
    timeout_seconds: float = 60.0
    max_retries: int = 3
    device: str = "auto"

    @classmethod
    def from_env(cls) -> "GemmaConfig":
        return cls(
            model_id=os.getenv(
                "MODELNOW_GEMMA_MODEL",
                os.getenv(
                    "GEMMA_MODEL",
                    "google/gemma-3-4b-it",
                ),
            ),
            base_url=os.getenv("GEMMA_BASE_URL"),
            api_key=os.getenv("GEMMA_API_KEY"),
            timeout_seconds=float(
                os.getenv("GEMMA_TIMEOUT_SECONDS", "60")
            ),
            max_retries=int(
                os.getenv("GEMMA_MAX_RETRIES", "3")
            ),
            device=os.getenv("GEMMA_DEVICE", "auto"),
        )

    def provider_config(self) -> ProviderConfig:
        return ProviderConfig(
            provider_id=self.provider_id,
            api_key=self.api_key,
            base_url=self.base_url,
            timeout_seconds=self.timeout_seconds,
            max_retries=self.max_retries,
        )
