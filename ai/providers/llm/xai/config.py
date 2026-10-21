from __future__ import annotations

import os
from dataclasses import dataclass

from ai.providers.base.config import ProviderConfig


@dataclass(frozen=True, slots=True)
class XAIConfig(ProviderConfig):
    provider_id: str = "xai"
    api_key: str | None = None
    base_url: str = "https://api.x.ai/v1"
    timeout_seconds: float = 60.0
    connect_timeout_seconds: float = 10.0
    max_retries: int = 3
    retry_enabled: bool = True
    enabled: bool = True
    organization: str | None = None
    default_model: str = "grok-4.7"

    @classmethod
    def from_env(cls, **overrides):
        api_key = (
            overrides.pop("api_key", None)
            or os.getenv("XAI_API_KEY")
            or os.getenv("XAI_KEY")
        )

        base_url = (
            overrides.pop("base_url", None)
            or os.getenv("XAI_BASE_URL")
            or "https://api.x.ai/v1"
        )

        timeout_seconds = float(
            overrides.pop(
                "timeout_seconds",
                os.getenv("XAI_TIMEOUT_SECONDS", "60"),
            )
        )

        connect_timeout_seconds = float(
            overrides.pop(
                "connect_timeout_seconds",
                os.getenv("XAI_CONNECT_TIMEOUT_SECONDS", "10"),
            )
        )

        max_retries = int(
            overrides.pop(
                "max_retries",
                os.getenv("XAI_MAX_RETRIES", "3"),
            )
        )

        default_model = (
            overrides.pop("default_model", None)
            or os.getenv("XAI_DEFAULT_MODEL")
            or "grok-4.7"
        )

        enabled = overrides.pop("enabled", True)

        if isinstance(enabled, str):
            enabled = enabled.lower() not in {
                "false",
                "0",
                "no",
                "off",
            }

        return cls(
            api_key=api_key,
            base_url=base_url.rstrip("/"),
            timeout_seconds=timeout_seconds,
            connect_timeout_seconds=connect_timeout_seconds,
            max_retries=max_retries,
            retry_enabled=overrides.pop("retry_enabled", True),
            enabled=enabled,
            default_model=default_model,
            **overrides,
        )

    @property
    def chat_url(self) -> str:
        return f"{self.base_url}/chat/completions"

    @property
    def models_url(self) -> str:
        return f"{self.base_url}/models"

    def auth_headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        return headers

    def validate(self) -> None:
        if not self.base_url:
            raise ValueError("xAI base_url is required")

        if self.timeout_seconds <= 0:
            raise ValueError(
                "xAI timeout_seconds must be greater than zero"
            )

        if self.connect_timeout_seconds <= 0:
            raise ValueError(
                "xAI connect_timeout_seconds must be greater than zero"
            )

        if self.max_retries < 0:
            raise ValueError(
                "xAI max_retries cannot be negative"
            )

        if not self.default_model:
            raise ValueError(
                "xAI default_model is required"
            )
