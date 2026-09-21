@'
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AnthropicConfig:
    api_key: str | None = None
    base_url: str | None = None
    timeout_seconds: float = 60.0
    max_retries: int = 3

    @classmethod
    def from_env(cls) -> "AnthropicConfig":
        return cls(
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            base_url=os.getenv("ANTHROPIC_BASE_URL"),
            timeout_seconds=float(
                os.getenv("ANTHROPIC_TIMEOUT_SECONDS", "60")
            ),
            max_retries=int(
                os.getenv("ANTHROPIC_MAX_RETRIES", "3")
            ),
        )

    def client_kwargs(self) -> dict:
        kwargs: dict = {}

        if self.api_key:
            kwargs["api_key"] = self.api_key

        if self.base_url:
            kwargs["base_url"] = self.base_url

        kwargs["timeout"] = self.timeout_seconds
        kwargs["max_retries"] = self.max_retries

        return kwargs


__all__ = ["AnthropicConfig"]
'@ | Set-Content -Encoding UTF8 ".\ai\providers\llm\anthropic\config.py"