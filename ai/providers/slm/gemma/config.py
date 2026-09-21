from __future__ import annotations

import os
from dataclasses import dataclass

from ...base.config import ProviderConfig


@dataclass
class GemmaConfig(ProviderConfig):
    provider_id: str = "gemma"
    enabled: bool = True
    api_key: str | None = None

    device: str = "auto"
    torch_dtype: str = "auto"
    trust_remote_code: bool = False

    default_model: str = "google/gemma-3-1b-it"
    max_new_tokens: int = 512

    huggingface_token: str | None = None

    def __post_init__(self) -> None:
        if not self.huggingface_token:
            self.huggingface_token = os.getenv("HF_TOKEN")

        model = os.getenv("MODELNOW_GEMMA_MODEL")
        if model:
            self.default_model = model

        device = os.getenv("MODELNOW_GEMMA_DEVICE")
        if device:
            self.device = device