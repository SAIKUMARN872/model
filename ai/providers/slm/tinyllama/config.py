from __future__ import annotations

import os
from dataclasses import dataclass

from ...base.config import ProviderConfig


@dataclass(frozen=True)
class TinyLlamaConfig(ProviderConfig):
    provider_id: str = "tinyllama"

    device: str = "auto"
    torch_dtype: str = "auto"
    trust_remote_code: bool = False

    default_model: str = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    max_new_tokens: int = 512

    huggingface_token: str | None = None

    @classmethod
    def from_env(cls) -> "TinyLlamaConfig":
        return cls(
            provider_id="tinyllama",
            api_key=None,
            enabled=_env_bool(
                "MODELNOW_TINYLLAMA_ENABLED",
                True,
            ),
            device=os.getenv(
                "MODELNOW_TINYLLAMA_DEVICE",
                "auto",
            ),
            torch_dtype=os.getenv(
                "MODELNOW_TINYLLAMA_TORCH_DTYPE",
                "auto",
            ),
            trust_remote_code=_env_bool(
                "MODELNOW_TINYLLAMA_TRUST_REMOTE_CODE",
                False,
            ),
            default_model=os.getenv(
                "MODELNOW_TINYLLAMA_MODEL",
                "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
            ),
            max_new_tokens=int(
                os.getenv(
                    "MODELNOW_TINYLLAMA_MAX_NEW_TOKENS",
                    "512",
                )
            ),
            huggingface_token=os.getenv("HF_TOKEN"),
            timeout_seconds=float(
                os.getenv(
                    "MODELNOW_PROVIDER_TIMEOUT",
                    "60",
                )
            ),
            connect_timeout_seconds=float(
                os.getenv(
                    "MODELNOW_PROVIDER_CONNECT_TIMEOUT",
                    "10",
                )
            ),
            max_retries=int(
                os.getenv(
                    "MODELNOW_PROVIDER_MAX_RETRIES",
                    "3",
                )
            ),
            retry_enabled=_env_bool(
                "MODELNOW_PROVIDER_RETRY_ENABLED",
                True,
            ),
            organization=None,
        )


def _env_bool(
    name: str,
    default: bool,
) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


__all__ = ["TinyLlamaConfig"]
