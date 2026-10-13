from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class DeepSeekConfig:
    provider_id: str = "deepseek"
    api_key: str | None = None
    base_url: str = "https://api.deepseek.com"
    timeout_seconds: float = 120.0
    max_retries: int = 3
    client_name: str = "modelnow"
    enabled: bool = True

    @classmethod
    def from_env(cls) -> "DeepSeekConfig":
        return cls(
            provider_id="deepseek",
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            base_url=os.getenv(
                "DEEPSEEK_BASE_URL",
                "https://api.deepseek.com",
            ).rstrip("/"),
            timeout_seconds=float(
                os.getenv(
                    "DEEPSEEK_TIMEOUT_SECONDS",
                    "120",
                )
            ),
            max_retries=int(
                os.getenv(
                    "DEEPSEEK_MAX_RETRIES",
                    "3",
                )
            ),
            client_name=os.getenv(
                "DEEPSEEK_CLIENT_NAME",
                "modelnow",
            ),
            enabled=os.getenv(
                "DEEPSEEK_ENABLED",
                "true",
            ).lower()
            in {"1", "true", "yes", "on"},
        )

    @property
    def configured(self) -> bool:
        return bool(
            self.api_key
            and self.base_url
        )

    def client_kwargs(self) -> dict:
        result = {
            "timeout": self.timeout_seconds,
            "max_retries": self.max_retries,
        }

        if self.api_key:
            result["api_key"] = self.api_key

        if self.base_url:
            result["base_url"] = self.base_url

        return result


__all__ = ["DeepSeekConfig"]
