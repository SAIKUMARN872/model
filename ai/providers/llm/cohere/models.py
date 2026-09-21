@'
from dataclasses import dataclass
from typing import Dict


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


COHERE_MODELS: Dict[str, CohereModelInfo] = {
    "command-a-03-2025": CohereModelInfo(
        model_id="command-a-03-2025",
        display_name="Command A",
        tier="llm",
        context_window=256_000,
        max_output_tokens=8_000,
        supports_reasoning=False,
        supports_vision=True,
    ),

    "command-a-plus-05-2026": CohereModelInfo(
        model_id="command-a-plus-05-2026",
        display_name="Command A Plus",
        tier="llm",
        context_window=256_000,
        max_output_tokens=32_000,
        supports_reasoning=True,
        supports_vision=True,
    ),

    "command-a-reasoning-08-2025": CohereModelInfo(
        model_id="command-a-reasoning-08-2025",
        display_name="Command A Reasoning",
        tier="llm",
        context_window=256_000,
        max_output_tokens=32_000,
        supports_reasoning=True,
        supports_vision=True,
    ),
}


def get_model(model_id: str) -> CohereModelInfo | None:
    return COHERE_MODELS.get(model_id)
'@ | Set-Content .\ai\providers\llm\cohere\models.py