@'
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AzureOpenAIConfig:
    """
    Azure OpenAI provider configuration.

    Azure uses a deployment name as the model identifier.
    """

    endpoint: str

    api_key: str | None = None

    api_version: str = "v1"

    timeout_seconds: float = 60.0

    max_retries: int = 3

    organization: str | None = None

    @classmethod
    def from_env(cls) -> "AzureOpenAIConfig":
        endpoint = (
            os.getenv(
                "AZURE_OPENAI_ENDPOINT",
                "",
            )
            .strip()
            .rstrip("/")
        )

        if not endpoint:
            raise ValueError(
                "AZURE_OPENAI_ENDPOINT is required."
            )

        return cls(
            endpoint=endpoint,
            api_key=os.getenv(
                "AZURE_OPENAI_API_KEY"
            ),
            api_version=os.getenv(
                "AZURE_OPENAI_API_VERSION",
                "v1",
            ),
            timeout_seconds=float(
                os.getenv(
                    "AZURE_OPENAI_TIMEOUT_SECONDS",
                    "60",
                )
            ),
            max_retries=int(
                os.getenv(
                    "AZURE_OPENAI_MAX_RETRIES",
                    "3",
                )
            ),
            organization=os.getenv(
                "AZURE_OPENAI_ORGANIZATION"
            ),
        )

    @property
    def base_url(self) -> str:
        return (
            f"{self.endpoint}/openai/"
            f"{self.api_version}"
        )

    def headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
        }

        if self.api_key:
            headers["api-key"] = self.api_key

        return headers


__all__ = [
    "AzureOpenAIConfig",
]
'@ | Set-Content ".\ai\providers\llm\azure_openai\config.py" -Encoding UTF8