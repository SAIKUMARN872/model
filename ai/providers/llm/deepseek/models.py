@'
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class DeepSeekModelInfo:
    model_id: str
    display_name: str
    tier: str

    context_window: int = 1_000_000
    max_output_tokens: int = 384_000

    supports_tools: bool = True
    supports_streaming: bool = True
    supports_reasoning: bool = True
    supports_json: bool = True
    supports_vision: bool = False


DEEPSEEK_MODELS: Dict[str, DeepSeekModelInfo] = {
    "deepseek-v4-flash": DeepSeekModelInfo(
        model_id="deepseek-v4-flash",
        display_name="DeepSeek V4 Flash",
        tier="mlm",
    ),
    "deepseek-v4-pro": DeepSeekModelInfo(
        model_id="deepseek-v4-pro",
        display_name="DeepSeek V4 Pro",
        tier="llm",
    ),
    "deepseek-v4-flash-vision-exp": DeepSeekModelInfo(
        model_id="deepseek-v4-flash-vision-exp",
        display_name="DeepSeek V4 Flash Vision Experimental",
        tier="mlm",
        supports_vision=True,
    ),
}


def get_model(
    model_id: str,
) -> DeepSeekModelInfo | None:
    return DEEPSEEK_MODELS.get(model_id)


def supported_models() -> List[str]:
    return list(DEEPSEEK_MODELS.keys())
'@ | Set-Content ".\ai\providers\llm\deepseek\models.py" -Encoding UTF8