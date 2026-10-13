from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GoogleModelInfo:
    model_id: str
    display_name: str
    tier: str
    context_window: int
    max_output_tokens: int
    supports_streaming: bool = True
    supports_tools: bool = True
    supports_reasoning: bool = False
    supports_vision: bool = False
    supports_audio: bool = False
    supports_structured_output: bool = True


GOOGLE_MODELS: dict[str, GoogleModelInfo] = {
    "gemini-2.5-pro": GoogleModelInfo(
        model_id="gemini-2.5-pro",
        display_name="Gemini 2.5 Pro",
        tier="llm",
        context_window=1_048_576,
        max_output_tokens=65_536,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=True,
        supports_vision=True,
        supports_audio=True,
        supports_structured_output=True,
    ),
    "gemini-2.5-flash": GoogleModelInfo(
        model_id="gemini-2.5-flash",
        display_name="Gemini 2.5 Flash",
        tier="llm",
        context_window=1_048_576,
        max_output_tokens=65_536,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=True,
        supports_vision=True,
        supports_audio=True,
        supports_structured_output=True,
    ),
}


def get_model(
    model_id: str,
) -> GoogleModelInfo | None:
    return GOOGLE_MODELS.get(
        model_id.strip()
    )


def is_supported_model(
    model_id: str,
) -> bool:
    return (
        model_id.strip()
        in GOOGLE_MODELS
    )


def list_models() -> list[GoogleModelInfo]:
    return list(
        GOOGLE_MODELS.values()
    )


__all__ = [
    "GoogleModelInfo",
    "GOOGLE_MODELS",
    "get_model",
    "is_supported_model",
    "list_models",
]
