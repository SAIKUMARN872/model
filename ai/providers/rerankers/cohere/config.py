from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True, slots=True)
class CohereRerankerConfig:
    provider_id: str = "cohere"
    model: str = "rerank-v3.5"
    api_key: str | None = None
    base_url: str = "https://api.cohere.com"
    timeout_seconds: float = 30.0
    enabled: bool = True
    mock_mode: bool = True

    @classmethod
    def from_env(cls) -> "CohereRerankerConfig":
        return cls(
            model=os.getenv(
                "MODELNOW_COHERE_RERANKER_MODEL",
                "rerank-v3.5",
            ),
            api_key=os.getenv("COHERE_API_KEY"),
            base_url=os.getenv(
                "MODELNOW_COHERE_RERANKER_BASE_URL",
                "https://api.cohere.com",
            ),
            timeout_seconds=float(
                os.getenv(
                    "MODELNOW_COHERE_RERANKER_TIMEOUT",
                    "30",
                )
            ),
            enabled=os.getenv(
                "MODELNOW_COHERE_RERANKER_ENABLED",
                "true",
            ).lower() not in {"0", "false", "no"},
            mock_mode=os.getenv(
                "MODELNOW_COHERE_RERANKER_MOCK",
                "true",
            ).lower() not in {"0", "false", "no"},
        )

    def validate(self) -> None:
        if not self.provider_id.strip():
            raise ValueError(
                "Cohere provider_id cannot be empty."
            )

        if not self.model.strip():
            raise ValueError(
                "Cohere reranker model cannot be empty."
            )

        if not self.base_url.strip():
            raise ValueError(
                "Cohere base_url cannot be empty."
            )

        if self.timeout_seconds <= 0:
            raise ValueError(
                "Cohere timeout_seconds must be greater than zero."
            )

        if not self.mock_mode and not self.api_key:
            raise ValueError(
                "COHERE_API_KEY is required when mock_mode is disabled."
            )
