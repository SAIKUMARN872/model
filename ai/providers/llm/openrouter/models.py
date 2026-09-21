@'
from dataclasses import dataclass
from typing import Dict


@dataclass(frozen=True)
class OpenRouterModelInfo:
    model_id: str
    display_name: str
    tier: str = "llm"
    context_window: int = 0
    max_output_tokens: int = 0
    supports_streaming: bool = True
    supports_tools: bool = True
    supports_vision: bool = False
    supports_reasoning: bool = False


OPENROUTER_MODELS: Dict[str, OpenRouterModelInfo] = {
    "openai/gpt-latest": OpenRouterModelInfo(
        model_id="openai/gpt-latest",
        display_name="OpenAI GPT Latest",
        tier="llm",
        supports_tools=True,
    ),

    "anthropic/claude-sonnet-latest": OpenRouterModelInfo(
        model_id="anthropic/claude-sonnet-latest",
        display_name="Anthropic Claude Sonnet",
        tier="llm",
        supports_tools=True,
        supports_reasoning=True,
    ),

    "google/gemini-flash-latest": OpenRouterModelInfo(
        model_id="google/gemini-flash-latest",
        display_name="Google Gemini Flash",
        tier="mlm",
        supports_tools=True,
        supports_vision=True,
    ),

    "deepseek/deepseek-v4-flash": OpenRouterModelInfo(
        model_id="deepseek/deepseek-v4-flash",
        display_name="DeepSeek V4 Flash",
        tier="mlm",
        supports_tools=True,
        supports_reasoning=True,
    ),
}


def get_model(
    model_id: str,
) -> OpenRouterModelInfo | None:
    return OPENROUTER_MODELS.get(model_id)
'@ | Set-Content .\ai\providers\llm\openrouter\models.py