from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DeepSeekModelInfo:
    model_id: str
    display_name: str
    tier: str
    context_window: int
    max_output_tokens: int
    supports_streaming: bool = True
    supports_tools: bool = True
    supports_reasoning: bool = False
    supports_vision: bool = False
    supports_structured_output: bool = True


DEEPSEEK_MODELS: dict[str, DeepSeekModelInfo] = {
    "deepseek-chat": DeepSeekModelInfo(
        model_id="deepseek-chat",
        display_name="DeepSeek Chat",
        tier="llm",
        context_window=128_000,
        max_output_tokens=8_000,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=False,
        supports_vision=False,
        supports_structured_output=True,
    ),
    "deepseek-reasoner": DeepSeekModelInfo(
        model_id="deepseek-reasoner",
        display_name="DeepSeek Reasoner",
        tier="llm",
        context_window=128_000,
        max_output_tokens=64_000,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=True,
        supports_vision=False,
        supports_structured_output=True,
    ),
}


def get_model(
    model_id: str,
) -> DeepSeekModelInfo | None:
    return DEEPSEEK_MODELS.get(
        model_id.strip()
    )


def is_supported_model(
    model_id: str,
) -> bool:
    return model_id.strip() in DEEPSEEK_MODELS


def list_models() -> list[DeepSeekModelInfo]:
    return list(DEEPSEEK_MODELS.values())


__all__ = [
    "DeepSeekModelInfo",
    "DEEPSEEK_MODELS",
    "get_model",
    "is_supported_model",
    "list_models",
]
