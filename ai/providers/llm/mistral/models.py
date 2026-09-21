@'
from dataclasses import dataclass
from typing import Dict


@dataclass(frozen=True)
class MistralModelInfo:
    model_id: str
    display_name: str
    tier: str
    context_window: int
    max_output_tokens: int
    supports_streaming: bool = True
    supports_tools: bool = True
    supports_json: bool = True
    supports_reasoning: bool = False
    supports_vision: bool = False


MISTRAL_MODELS: Dict[str, MistralModelInfo] = {
    "mistral-large-latest": MistralModelInfo(
        model_id="mistral-large-latest",
        display_name="Mistral Large 3",
        tier="llm",
        context_window=256_000,
        max_output_tokens=32_000,
        supports_reasoning=True,
        supports_vision=True,
    ),
    "mistral-medium-latest": MistralModelInfo(
        model_id="mistral-medium-latest",
        display_name="Mistral Medium 3.5",
        tier="llm",
        context_window=256_000,
        max_output_tokens=32_000,
        supports_reasoning=True,
        supports_vision=True,
    ),
    "mistral-small-latest": MistralModelInfo(
        model_id="mistral-small-latest",
        display_name="Mistral Small 4",
        tier="mlm",
        context_window=256_000,
        max_output_tokens=32_000,
        supports_reasoning=True,
        supports_vision=True,
    ),
    "ministral-14b-latest": MistralModelInfo(
        model_id="ministral-14b-latest",
        display_name="Ministral 3 14B",
        tier="mlm",
        context_window=256_000,
        max_output_tokens=32_000,
        supports_vision=True,
    ),
    "ministral-8b-latest": MistralModelInfo(
        model_id="ministral-8b-latest",
        display_name="Ministral 3 8B",
        tier="slm",
        context_window=256_000,
        max_output_tokens=32_000,
        supports_vision=True,
    ),
    "ministral-3b-latest": MistralModelInfo(
        model_id="ministral-3b-latest",
        display_name="Ministral 3 3B",
        tier="slm",
        context_window=256_000,
        max_output_tokens=32_000,
        supports_vision=True,
    ),
}
'@ | Set-Content .\ai\providers\llm\mistral\models.py