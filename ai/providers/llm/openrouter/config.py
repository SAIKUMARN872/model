from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Mapping

from ai.providers.base.config import ProviderConfig


DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_OPENROUTER_API_VERSION = "v1"


@dataclass(slots=True)
class OpenRouterConfig:
    endpoint: str = DEFAULT_OPENROUTER_BASE_URL
    api_key: str | None = None
    timeout_seconds: float = 60.0
    connect_timeout_seconds: float = 10.0
    max_retries: int = 3
    retry_enabled: bool = True
    enabled: bool = True

    http_referer: str | None = None
    x_title: str | None = None

    default_headers: Mapping[str, str] = field(default_factory=dict)

    @classmethod
    def from_env(cls) -> "OpenRouterConfig":
        return cls(
            endpoint=(
                os.getenv("OPENROUTER_BASE_URL")
                or DEFAULT_OPENROUTER_BASE_URL
            ).rstrip("/"),
            api_key=os.getenv("OPENROUTER_API_KEY"),
            timeout_seconds=float(
                os.getenv("OPENROUTER_TIMEOUT_SECONDS", "60")
            ),
            connect_timeout_seconds=float(
                os.getenv("OPENROUTER_CONNECT_TIMEOUT_SECONDS", "10")
            ),
            max_retries=int(
                os.getenv("OPENROUTER_MAX_RETRIES", "3")
            ),
            retry_enabled=os.getenv(
                "OPENROUTER_RETRY_ENABLED",
                "true",
            ).lower() not in {"0", "false", "no"},
            enabled=os.getenv(
                "OPENROUTER_ENABLED",
                "true",
            ).lower() not in {"0", "false", "no"},
            http_referer=os.getenv("OPENROUTER_HTTP_REFERER"),
            x_title=os.getenv("OPENROUTER_X_TITLE"),
        )

    @classmethod
    def from_provider_config(
        cls,
        config: ProviderConfig,
    ) -> "OpenRouterConfig":
        metadata = config.extra_metadata

        return cls(
            endpoint=(
                config.base_url or DEFAULT_OPENROUTER_BASE_URL
            ).rstrip("/"),
            api_key=config.api_key,
            timeout_seconds=config.timeout_seconds,
            connect_timeout_seconds=config.connect_timeout_seconds,
            max_retries=config.max_retries,
            retry_enabled=config.retry_enabled,
            enabled=config.enabled,
            http_referer=metadata.get("http_referer"),
            x_title=metadata.get("x_title"),
            default_headers=dict(config.headers),
        )

    @property
    def configured(self) -> bool:
        return bool(self.endpoint and self.api_key)

    @property
    def base_url(self) -> str:
        return self.endpoint.rstrip("/")

    @property
    def chat_completions_url(self) -> str:
        return f"{self.base_url}/chat/completions"

    @property
    def models_url(self) -> str:
        return f"{self.base_url}/models"

    @property
    def headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        if self.http_referer:
            headers["HTTP-Referer"] = self.http_referer

        if self.x_title:
            headers["X-Title"] = self.x_title

        headers.update(dict(self.default_headers))

        return headers

    def with_updates(self, **updates) -> "OpenRouterConfig":
        values = {
            "endpoint": self.endpoint,
            "api_key": self.api_key,
            "timeout_seconds": self.timeout_seconds,
            "connect_timeout_seconds": self.connect_timeout_seconds,
            "max_retries": self.max_retries,
            "retry_enabled": self.retry_enabled,
            "enabled": self.enabled,
            "http_referer": self.http_referer,
            "x_title": self.x_title,
            "default_headers": dict(self.default_headers),
        }

        values.update(updates)
        return OpenRouterConfig(**values)
