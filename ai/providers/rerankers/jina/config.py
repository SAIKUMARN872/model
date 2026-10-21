from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True, slots=True)
class JinaRerankerConfig:
    provider_id: str = "jina"
    model: str = "jina-reranker-v2-base-multilingual"
    api_key: str | None = None
    base_url: str = "https://api.jina.ai/v1"
    timeout_seconds: float = 30.0
    enabled: bool = True
    mock_mode: bool = True

    @classmethod
    def from_env(cls) -> "JinaRerankerConfig":
        return cls(
            model=os.getenv(
                "MODELNOW_JINA_RERANKER_MODEL",
                "jina-reranker-v2-base-multilingual",
            ),
            api_key=os.getenv("JINA_API_KEY"),
            base_url=os.getenv(
                "MODELNOW_JINA_RERANKER_BASE_URL",
                "https://api.jina.ai/v1",
            ),
            timeout_seconds=float(
                os.getenv(
                    "MODELNOW_JINA_RERANKER_TIMEOUT",
                    "30",
                )
            ),
            enabled=os.getenv(
                "MODELNOW_JINA_RERANKER_ENABLED",
                "true",
            ).lower() not in {"0", "false", "no"},
            mock_mode=os.getenv(
                "MODELNOW_JINA_RERANKER_MOCK",
                "true",
            ).lower() not in {"0", "false", "no"},
        )

    def validate(self) -> None:
        if not self.provider_id.strip():
            raise ValueError(
                "Jina provider_id cannot be empty."
            )

        if not self.model.strip():
            raise ValueError(
                "Jina reranker model cannot be empty."
            )

        if not self.base_url.strip():
            raise ValueError(
                "Jina base_url cannot be empty."
            )

        if self.timeout_seconds <= 0:
            raise ValueError(
                "Jina timeout_seconds must be greater than zero."
            )

        if not self.mock_mode and not self.api_key:
            raise ValueError(
                "JINA_API_KEY is required when mock_mode is disabled."
            )
