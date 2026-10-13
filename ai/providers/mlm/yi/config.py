from __future__ import annotations

import os
from dataclasses import dataclass

from ...base.config import ProviderConfig


@dataclass(frozen=True)
class YiConfig:
    provider_id: str = "yi"
    model_id: str = "01-ai/Yi-1.5-9B-Chat"
    base_url: str | None = None
    api_key: str | None = None
    timeout_seconds: float = 60.0
    max_retries: int = 3
    device: str = "auto"

    @classmethod
    def from_env(cls) -> "YiConfig":
        return cls(
            model_id=os.getenv(
                "MODELNOW_YI_MODEL",
                os.getenv(
                    "YI_MODEL",
                    "01-ai/Yi-1.5-9B-Chat",
                ),
            ),
            base_url=os.getenv("YI_BASE_URL"),
            api_key=os.getenv("YI_API_KEY"),
            timeout_seconds=float(
                os.getenv("YI_TIMEOUT_SECONDS", "60")
            ),
            max_retries=int(
                os.getenv("YI_MAX_RETRIES", "3")
            ),
            device=os.getenv("YI_DEVICE", "auto"),
        )

    def provider_config(self) -> ProviderConfig:
        return ProviderConfig(
            provider_id=self.provider_id,
            api_key=self.api_key,
            base_url=self.base_url,
            timeout_seconds=self.timeout_seconds,
            max_retries=self.max_retries,
        )
