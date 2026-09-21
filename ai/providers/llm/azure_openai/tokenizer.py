cd "C:\Users\pamar\Downloads\model-main\model-main"

@'
from __future__ import annotations

from ai.providers.base import (
    ApproximateTokenizer,
    BaseTokenizer,
    estimate_tokens,
)


class AzureOpenAITokenizer(ApproximateTokenizer):
    """
    ModelNow tokenizer adapter for Azure OpenAI.

    This uses ModelNow's approximate tokenizer foundation.
    A model-specific tokenizer can be plugged in later when
    exact token accounting is required.
    """

    provider = "azure_openai"

    def __init__(
        self,
        *,
        model: str | None = None,
        chars_per_token: float = 4.0,
    ) -> None:
        super().__init__(
            chars_per_token=chars_per_token,
        )

        self.model = model

    def count_tokens(self, text: str) -> int:
        return super().count_tokens(text)


def estimate_azure_tokens(
    text: str,
    *,
    model: str | None = None,
) -> int:
    tokenizer = AzureOpenAITokenizer(model=model)
    return tokenizer.count_tokens(text)


__all__ = [
    "AzureOpenAITokenizer",
    "BaseTokenizer",
    "estimate_azure_tokens",
    "estimate_tokens",
]
'@ | Set-Content ".\ai\providers\llm\azure_openai\tokenizer.py" -Encoding UTF8