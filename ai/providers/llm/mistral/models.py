from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MistralModelInfo:
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


MISTRAL_MODELS: dict[str, MistralModelInfo] = {
    "mistral-large-latest": MistralModelInfo(
        model_id="mistral-large-latest",
        display_name="Mistral Large",
        tier="llm",
        context_window=128_000,
        max_output_tokens=32_000,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=False,
        supports_vision=True,
        supports_structured_output=True,
    ),
    "mistral-medium-latest": MistralModelInfo(
        model_id="mistral-medium-latest",
        display_name="Mistral Medium",
        tier="llm",
        context_window=128_000,
        max_output_tokens=32_000,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=False,
        supports_vision=True,
        supports_structured_output=True,
    ),
}


def get_model(model_id: str) -> MistralModelInfo | None:
    return MISTRAL_MODELS.get(model_id.strip())


def is_supported_model(model_id: str) -> bool:
    return model_id.strip() in MISTRAL_MODELS


def list_models() -> list[MistralModelInfo]:
    return list(MISTRAL_MODELS.values())


__all__ = [
    "MistralModelInfo",
    "MISTRAL_MODELS",
    "get_model",
    "is_supported_model",
    "list_models",
]
