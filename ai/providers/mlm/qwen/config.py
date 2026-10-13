from __future__ import annotations

import os
from dataclasses import dataclass

from ...base.config import ProviderConfig


@dataclass(frozen=True)
class QwenConfig:
    provider_id: str = "qwen"
    model_id: str = "Qwen/Qwen3-8B"
    base_url: str | None = None
    api_key: str | None = None
    timeout_seconds: float = 60.0
    max_retries: int = 3
    device: str = "auto"

    @classmethod
    def from_env(cls) -> "QwenConfig":
        return cls(
            model_id=os.getenv(
                "MODELNOW_QWEN_MODEL",
                os.getenv(
                    "QWEN_MODEL",
                    "Qwen/Qwen3-8B",
                ),
            ),
            base_url=os.getenv("QWEN_BASE_URL"),
            api_key=os.getenv("QWEN_API_KEY"),
            timeout_seconds=float(
                os.getenv("QWEN_TIMEOUT_SECONDS", "60")
            ),
            max_retries=int(
                os.getenv("QWEN_MAX_RETRIES", "3")
            ),
            device=os.getenv("QWEN_DEVICE", "auto"),
        )

    def provider_config(self) -> ProviderConfig:
        return ProviderConfig(
            provider_id=self.provider_id,
            api_key=self.api_key,
            base_url=self.base_url,
            timeout_seconds=self.timeout_seconds,
            max_retries=self.max_retries,
        )
