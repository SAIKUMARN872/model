from __future__ import annotations

import re


class XAITokenizer:
    """
    Lightweight tokenizer estimation.

    Exact tokenization depends on the model tokenizer.
    This class provides deterministic estimates when the
    tokenizer package is not installed.
    """

    def __init__(self, model: str = "grok-4.7"):
        self.model = model

    def encode(self, text: str) -> list[str]:
        if not text:
            return []

        return re.findall(
            r"\w+|[^\w\s]",
            text,
            flags=re.UNICODE,
        )

    def decode(self, tokens: list[str]) -> str:
        return " ".join(tokens)

    def count_tokens(self, text: str) -> int:
        if not text:
            return 0

        return len(self.encode(text))

    def estimate_tokens(self, text: str) -> int:
        return max(1, round(len(text) / 4)) if text else 0

    def count_messages(self, messages) -> int:
        total = 0

        for message in messages:
            total += self.count_tokens(
                getattr(message, "content", "") or ""
            )
            total += 4

        return total

    @property
    def model_name(self) -> str:
        return self.model
