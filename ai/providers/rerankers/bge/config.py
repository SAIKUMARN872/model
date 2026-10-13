from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True, slots=True)
class BGEConfig:
    provider_id: str = "bge"
    model: str = "BAAI/bge-reranker-v2-m3"
    base_url: str | None = None
    api_key: str | None = None
    timeout_seconds: float = 30.0
    enabled: bool = True
    local_mode: bool = True

    @classmethod
    def from_env(cls) -> "BGEConfig":
        return cls(
            model=os.getenv(
                "MODELNOW_BGE_MODEL",
                "BAAI/bge-reranker-v2-m3",
            ),
            base_url=os.getenv("MODELNOW_BGE_BASE_URL"),
            api_key=os.getenv("MODELNOW_BGE_API_KEY"),
            timeout_seconds=float(
                os.getenv("MODELNOW_BGE_TIMEOUT", "30")
            ),
            enabled=os.getenv(
                "MODELNOW_BGE_ENABLED",
                "true",
            ).lower() not in {"0", "false", "no"},
            local_mode=os.getenv(
                "MODELNOW_BGE_LOCAL_MODE",
                "true",
            ).lower() not in {"0", "false", "no"},
        )

    def validate(self) -> None:
        if not self.provider_id.strip():
            raise ValueError(
                "BGE provider_id cannot be empty."
            )

        if not self.model.strip():
            raise ValueError(
                "BGE model cannot be empty."
            )

        if self.timeout_seconds <= 0:
            raise ValueError(
                "BGE timeout_seconds must be greater than zero."
            )

        if not self.local_mode and not self.base_url:
            raise ValueError(
                "BGE base_url is required when local_mode is disabled."
            )
