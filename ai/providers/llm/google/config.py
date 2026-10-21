from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class GoogleConfig:
    provider_id: str = "google"
    api_key: str | None = None
    base_url: str = "https://generativelanguage.googleapis.com"
    timeout_seconds: float = 120.0
    max_retries: int = 3
    client_name: str = "modelnow"
    enabled: bool = True

    @classmethod
    def from_env(cls) -> "GoogleConfig":
        return cls(
            provider_id="google",
            api_key=os.getenv("GOOGLE_API_KEY")
            or os.getenv("GEMINI_API_KEY"),
            base_url=os.getenv(
                "GOOGLE_BASE_URL",
                "https://generativelanguage.googleapis.com",
            ).rstrip("/"),
            timeout_seconds=float(
                os.getenv("GOOGLE_TIMEOUT_SECONDS", "120")
            ),
            max_retries=int(
                os.getenv("GOOGLE_MAX_RETRIES", "3")
            ),
            client_name=os.getenv(
                "GOOGLE_CLIENT_NAME",
                "modelnow",
            ),
            enabled=os.getenv(
                "GOOGLE_ENABLED",
                "true",
            ).strip().lower()
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


__all__ = ["GoogleConfig"]
