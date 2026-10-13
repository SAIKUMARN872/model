from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class MistralConfig:
    provider_id: str = "mistral"
    api_key: str | None = None
    base_url: str = "https://api.mistral.ai"
    timeout_seconds: float = 120.0
    max_retries: int = 3
    client_name: str = "modelnow"
    enabled: bool = True

    @classmethod
    def from_env(cls) -> "MistralConfig":
        return cls(
            provider_id="mistral",
            api_key=os.getenv("MISTRAL_API_KEY"),
            base_url=os.getenv(
                "MISTRAL_BASE_URL",
                "https://api.mistral.ai",
            ).rstrip("/"),
            timeout_seconds=float(
                os.getenv("MISTRAL_TIMEOUT_SECONDS", "120")
            ),
            max_retries=int(
                os.getenv("MISTRAL_MAX_RETRIES", "3")
            ),
            client_name=os.getenv(
                "MISTRAL_CLIENT_NAME",
                "modelnow",
            ),
            enabled=os.getenv(
                "MISTRAL_ENABLED",
                "true",
            ).strip().lower()
            in {"1", "true", "yes", "on"},
        )

    @property
    def configured(self) -> bool:
        return bool(self.api_key and self.base_url)

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


__all__ = ["MistralConfig"]
