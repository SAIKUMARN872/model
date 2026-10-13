from __future__ import annotations

from typing import Iterable

from ai.providers.base.request import ChatMessage


class AzureTokenizer:
    """Lightweight token estimator with optional tiktoken support."""

    def __init__(self, model: str | None = None) -> None:
        self.model = model
        self._encoder = None

        try:
            import tiktoken

            try:
                self._encoder = tiktoken.encoding_for_model(model or "gpt-4")
            except Exception:
                self._encoder = tiktoken.get_encoding("cl100k_base")
        except Exception:
            self._encoder = None

    def count_text(self, text: str) -> int:
        if not text:
            return 0

        if self._encoder is not None:
            try:
                return len(self._encoder.encode(text))
            except Exception:
                pass

        return max(1, len(text) // 4)

    def count_messages(self, messages: Iterable[ChatMessage]) -> int:
        total = 0

        for message in messages:
            total += 4
            total += self.count_text(message.role)
            total += self.count_text(message.content)

            if message.name:
                total += self.count_text(message.name)

        return total + 2

    def estimate_completion(self, text: str) -> int:
        return self.count_text(text)
