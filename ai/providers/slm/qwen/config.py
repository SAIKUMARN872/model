from __future__ import annotations

import os
from dataclasses import dataclass

from ...base.config import ProviderConfig


@dataclass(frozen=True)
class QwenConfig(ProviderConfig):
    provider_id: str = "qwen"

    device: str = "auto"
    torch_dtype: str = "auto"
    trust_remote_code: bool = False

    default_model: str = "Qwen/Qwen2.5-0.5B-Instruct"
    max_new_tokens: int = 512

    huggingface_token: str | None = None

    @classmethod
    def from_env(cls) -> "QwenConfig":
        return cls(
            provider_id="qwen",
            api_key=None,
            enabled=_env_bool("MODELNOW_QWEN_ENABLED", True),
            device=os.getenv("MODELNOW_QWEN_DEVICE", "auto"),
            torch_dtype=os.getenv("MODELNOW_QWEN_TORCH_DTYPE", "auto"),
            trust_remote_code=_env_bool(
                "MODELNOW_QWEN_TRUST_REMOTE_CODE",
                False,
            ),
            default_model=os.getenv(
                "MODELNOW_QWEN_MODEL",
                "Qwen/Qwen2.5-0.5B-Instruct",
            ),
            max_new_tokens=int(
                os.getenv("MODELNOW_QWEN_MAX_NEW_TOKENS", "512")
            ),
            huggingface_token=os.getenv("HF_TOKEN"),
            timeout_seconds=float(
                os.getenv("MODELNOW_PROVIDER_TIMEOUT", "60")
            ),
            connect_timeout_seconds=float(
                os.getenv(
                    "MODELNOW_PROVIDER_CONNECT_TIMEOUT",
                    "10",
                )
            ),
            max_retries=int(
                os.getenv("MODELNOW_PROVIDER_MAX_RETRIES", "3")
            ),
            retry_enabled=_env_bool(
                "MODELNOW_PROVIDER_RETRY_ENABLED",
                True,
            ),
            organization=None,
        )


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


__all__ = ["QwenConfig"]
