@'
from dataclasses import dataclass
from typing import Dict


@dataclass(frozen=True)
class XAIModelInfo:
    model_id: str
    display_name: str
    tier: str
    context_window: int
    max_output_tokens: int = 0
    supports_streaming: bool = True
    supports_tools: bool = True
    supports_reasoning: bool = True
    supports_vision: bool = True


XAI_MODELS: Dict[str, XAIModelInfo] = {
    "grok-4.6": XAIModelInfo(
        model_id="grok-4.6",
        display_name="Grok 4.6",
        tier="llm",
        context_window=0,
        supports_reasoning=True,
        supports_vision=True,
    ),
}


def get_model(model_id: str) -> XAIModelInfo | None:
    return XAI_MODELS.get(model_id)
'@ | Set-Content .\ai\providers\llm\xai\models.py