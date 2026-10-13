from __future__ import annotations

import os
from dataclasses import dataclass

from ...base.config import ProviderConfig


@dataclass(frozen=True)
class LlamaConfig:
    provider_id: str = "llama"
    model_id: str = "meta-llama/Llama-3.1-8B-Instruct"
    base_url: str | None = None
    api_key: str | None = None
    timeout_seconds: float = 60.0
    max_retries: int = 3
    device: str = "auto"

    @classmethod
    def from_env(cls) -> "LlamaConfig":
        return cls(
            model_id=os.getenv(
                "MODELNOW_LLAMA_MODEL",
                os.getenv(
                    "LLAMA_MODEL",
                    "meta-llama/Llama-3.1-8B-Instruct",
                ),
            ),
            base_url=os.getenv("LLAMA_BASE_URL"),
            api_key=os.getenv("LLAMA_API_KEY"),
            timeout_seconds=float(
                os.getenv("LLAMA_TIMEOUT_SECONDS", "60")
            ),
            max_retries=int(
                os.getenv("LLAMA_MAX_RETRIES", "3")
            ),
            device=os.getenv("LLAMA_DEVICE", "auto"),
        )

    def provider_config(self) -> ProviderConfig:
        return ProviderConfig(
            provider_id=self.provider_id,
            api_key=self.api_key,
            base_url=self.base_url,
            timeout_seconds=self.timeout_seconds,
            max_retries=self.max_retries,
        )
