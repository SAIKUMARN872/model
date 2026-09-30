from __future__ import annotations

import os
from dataclasses import dataclass

from ...base.config import ProviderConfig


@dataclass(frozen=True)
class PhiConfig(ProviderConfig):
    provider_id: str = "phi"

    device: str = "auto"
    torch_dtype: str = "auto"
    trust_remote_code: bool = False

    default_model: str = "microsoft/Phi-3-mini-4k-instruct"
    max_new_tokens: int = 512

    huggingface_token: str | None = None

    @classmethod
    def from_env(cls) -> "PhiConfig":
        return cls(
            provider_id="phi",
            api_key=None,
            enabled=_env_bool("MODELNOW_PHI_ENABLED", True),
            device=os.getenv(
                "MODELNOW_PHI_DEVICE",
                "auto",
            ),
            torch_dtype=os.getenv(
                "MODELNOW_PHI_TORCH_DTYPE",
                "auto",
            ),
            trust_remote_code=_env_bool(
                "MODELNOW_PHI_TRUST_REMOTE_CODE",
                False,
            ),
            default_model=os.getenv(
                "MODELNOW_PHI_MODEL",
                "microsoft/Phi-3-mini-4k-instruct",
            ),
            max_new_tokens=int(
                os.getenv(
                    "MODELNOW_PHI_MAX_NEW_TOKENS",
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


__all__ = ["PhiConfig"]
