from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True, slots=True)
class MixedbreadRerankerConfig:
    provider_id: str = "mixedbread"
    model: str = "mixedbread-ai/mxbai-rerank-large-v2"
    api_key: str | None = None
    base_url: str = "https://api.mixedbread.com/v1"
    timeout_seconds: float = 30.0
    enabled: bool = True
    mock_mode: bool = True

    @classmethod
    def from_env(cls) -> "MixedbreadRerankerConfig":
        return cls(
            model=os.getenv(
                "MODELNOW_MIXEDBREAD_RERANKER_MODEL",
                "mixedbread-ai/mxbai-rerank-large-v2",
            ),
            api_key=os.getenv("MIXEDBREAD_API_KEY"),
            base_url=os.getenv(
                "MODELNOW_MIXEDBREAD_RERANKER_BASE_URL",
                "https://api.mixedbread.com/v1",
            ),
            timeout_seconds=float(
                os.getenv(
                    "MODELNOW_MIXEDBREAD_RERANKER_TIMEOUT",
                    "30",
                )
            ),
            enabled=os.getenv(
                "MODELNOW_MIXEDBREAD_RERANKER_ENABLED",
                "true",
            ).lower() not in {"0", "false", "no"},
            mock_mode=os.getenv(
                "MODELNOW_MIXEDBREAD_RERANKER_MOCK",
                "true",
            ).lower() not in {"0", "false", "no"},
        )

    def validate(self) -> None:
        if not self.provider_id.strip():
            raise ValueError(
                "Mixedbread provider_id cannot be empty."
            )

        if not self.model.strip():
            raise ValueError(
                "Mixedbread reranker model cannot be empty."
            )

        if not self.base_url.strip():
            raise ValueError(
                "Mixedbread base_url cannot be empty."
            )

        if self.timeout_seconds <= 0:
            raise ValueError(
                "Mixedbread timeout_seconds must be greater than zero."
            )

        if not self.mock_mode and not self.api_key:
            raise ValueError(
                "MIXEDBREAD_API_KEY is required when mock_mode is disabled."
            )
