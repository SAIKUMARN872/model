from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class AzureOpenAIConfig:
    endpoint: str
    api_key: str | None = None
    api_version: str = "2025-04-01-preview"
    timeout_seconds: float = 60.0
    connect_timeout_seconds: float = 10.0
    max_retries: int = 3
    enabled: bool = True

    @classmethod
    def from_env(cls) -> "AzureOpenAIConfig":
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip()
        api_key = os.getenv("AZURE_OPENAI_API_KEY")
        api_version = os.getenv(
            "AZURE_OPENAI_API_VERSION",
            "2025-04-01-preview",
        )

        return cls(
            endpoint=endpoint.rstrip("/"),
            api_key=api_key,
            api_version=api_version,
            timeout_seconds=float(
                os.getenv("AZURE_OPENAI_TIMEOUT_SECONDS", "60")
            ),
            connect_timeout_seconds=float(
                os.getenv("AZURE_OPENAI_CONNECT_TIMEOUT_SECONDS", "10")
            ),
            max_retries=int(
                os.getenv("AZURE_OPENAI_MAX_RETRIES", "3")
            ),
            enabled=os.getenv(
                "AZURE_OPENAI_ENABLED",
                "true",
            ).lower()
            in {"1", "true", "yes", "on"},
        )

    @property
    def configured(self) -> bool:
        return bool(self.endpoint and self.api_key)

    def deployment_url(self, deployment: str) -> str:
        if not self.endpoint:
            raise ValueError("Azure OpenAI endpoint is not configured")

        return (
            f"{self.endpoint}/openai/deployments/"
            f"{deployment}/chat/completions"
            f"?api-version={self.api_version}"
        )

    @property
    def headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
        }

        if self.api_key:
            headers["api-key"] = self.api_key

        return headers
