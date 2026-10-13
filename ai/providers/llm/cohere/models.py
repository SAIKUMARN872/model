from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CohereModelInfo:
    model_id: str
    display_name: str
    tier: str
    context_window: int
    max_output_tokens: int
    supports_streaming: bool = True
    supports_tools: bool = True
    supports_reasoning: bool = False
    supports_vision: bool = False
    supports_citations: bool = True
    supports_structured_output: bool = True


COHERE_MODELS: dict[str, CohereModelInfo] = {
    "command-a-plus-05-2026": CohereModelInfo(
        model_id="command-a-plus-05-2026",
        display_name="Command A+",
        tier="llm",
        context_window=128_000,
        max_output_tokens=64_000,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=True,
        supports_vision=True,
        supports_citations=True,
        supports_structured_output=True,
    ),

    "command-a-reasoning-08-2025": CohereModelInfo(
        model_id="command-a-reasoning-08-2025",
        display_name="Command A Reasoning",
        tier="llm",
        context_window=256_000,
        max_output_tokens=32_000,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=True,
        supports_vision=True,
        supports_citations=True,
        supports_structured_output=True,
    ),

    "command-a-03-2025": CohereModelInfo(
        model_id="command-a-03-2025",
        display_name="Command A",
        tier="llm",
        context_window=256_000,
        max_output_tokens=8_000,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=False,
        supports_vision=False,
        supports_citations=True,
        supports_structured_output=True,
    ),

    "command-r7b-12-2024": CohereModelInfo(
        model_id="command-r7b-12-2024",
        display_name="Command R7B",
        tier="mlm",
        context_window=128_000,
        max_output_tokens=4_000,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=False,
        supports_vision=False,
        supports_citations=True,
        supports_structured_output=True,
    ),

    "command-r-08-2024": CohereModelInfo(
        model_id="command-r-08-2024",
        display_name="Command R",
        tier="mlm",
        context_window=128_000,
        max_output_tokens=4_000,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=False,
        supports_vision=False,
        supports_citations=True,
        supports_structured_output=True,
    ),

    "command-r-plus-08-2024": CohereModelInfo(
        model_id="command-r-plus-08-2024",
        display_name="Command R+",
        tier="llm",
        context_window=128_000,
        max_output_tokens=4_000,
        supports_streaming=True,
        supports_tools=True,
        supports_reasoning=False,
        supports_vision=False,
        supports_citations=True,
        supports_structured_output=True,
    ),
}


def get_model(model_id: str) -> CohereModelInfo | None:
    return COHERE_MODELS.get(model_id)


def is_supported_model(model_id: str) -> bool:
    return model_id in COHERE_MODELS


def list_models() -> list[CohereModelInfo]:
    return list(COHERE_MODELS.values())


__all__ = [
    "CohereModelInfo",
    "COHERE_MODELS",
    "get_model",
    "is_supported_model",
    "list_models",
]
