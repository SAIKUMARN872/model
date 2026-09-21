@'
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class GoogleModelInfo:
    model_id: str
    display_name: str
    tier: str

    context_window: int = 0
    max_output_tokens: int = 0

    supports_tools: bool = True
    supports_vision: bool = True
    supports_streaming: bool = True
    supports_audio: bool = False


GOOGLE_MODELS: Dict[str, GoogleModelInfo] = {
    "gemini-3.1-pro": GoogleModelInfo(
        model_id="gemini-3.1-pro",
        display_name="Gemini 3.1 Pro",
        tier="llm",
    ),
    "gemini-3.6-flash": GoogleModelInfo(
        model_id="gemini-3.6-flash",
        display_name="Gemini 3.6 Flash",
        tier="mlm",
    ),
    "gemini-3.5-flash": GoogleModelInfo(
        model_id="gemini-3.5-flash",
        display_name="Gemini 3.5 Flash",
        tier="mlm",
    ),
    "gemini-3.5-flash-lite": GoogleModelInfo(
        model_id="gemini-3.5-flash-lite",
        display_name="Gemini 3.5 Flash-Lite",
        tier="slm",
    ),
}


def get_model(model_id: str) -> GoogleModelInfo | None:
    return GOOGLE_MODELS.get(model_id)


def supported_models() -> List[str]:
    return list(GOOGLE_MODELS.keys())
'@ | Set-Content ".\ai\providers\llm\google\models.py" -Encoding UTF8