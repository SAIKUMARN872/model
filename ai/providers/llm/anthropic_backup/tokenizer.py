Set-Content ".\ai\providers\llm\anthropic\tokenizer.py" @'
from __future__ import annotations

import math


class AnthropicTokenizer:
    """
    Lightweight token estimation.

    Anthropic tokenization is provider-specific. This class intentionally
    provides an approximation for ModelNow routing and cost prediction when
    exact tokenizer data is unavailable.
    """

    @staticmethod
    def count_text(text: str) -> int:
        if not text:
            return 0

        characters = len(text)
        words = len(text.split())

        return max(
            words,
            math.ceil(characters / 4),
        )

    @classmethod
    def count_messages(cls, messages) -> int:
        total = 0

        for message in messages:
            content = getattr(
                message,
                "content",
                "",
            )

            if not isinstance(content, str):
                content = str(content)

            total += cls.count_text(content)
            total += 4

        return total

    @classmethod
    def count(cls, value) -> int:
        if isinstance(value, str):
            return cls.count_text(value)

        if isinstance(value, (list, tuple)):
            return cls.count_messages(value)

        return cls.count_text(str(value))


__all__ = ["AnthropicTokenizer"]
'@