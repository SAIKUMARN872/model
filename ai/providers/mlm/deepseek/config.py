from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class DeepSeekConfig:
    provider_id: str = "deepseek"
    api_key: str | None = None
    base_url: str = "https://api.deepseek.com"
    timeout_seconds: float = 60.0
    max_retries: int = 3

    @classmethod
    def from_env(cls) -> "DeepSeekConfig":
        return cls(
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            base_url=os.getenv(
                "DEEPSEEK_BASE_URL",
                "https://api.deepseek.com",
            ),
            timeout_seconds=float(
                os.getenv("DEEPSEEK_TIMEOUT_SECONDS", "60")
            ),
            max_retries=int(
                os.getenv("DEEPSEEK_MAX_RETRIES", "3")
            ),
        )

    def client_kwargs(self) -> dict:
        kwargs: dict = {
            "base_url": self.base_url,
            "timeout": self.timeout_seconds,
            "max_retries": self.max_retries,
        }

        if self.api_key:
            kwargs["api_key"] = self.api_key

        return kwargs


__all__ = ["DeepSeekConfig"]
