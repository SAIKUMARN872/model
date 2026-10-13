from __future__ import annotations

from typing import Any


class DeepSeekTokenizer:
    """Lightweight tokenizer interface for DeepSeek requests."""

    def __init__(
        self,
        model_id: str = "deepseek",
    ) -> None:
        self.model_id = model_id

    def count_text(self, text: str) -> int:
        """Estimate token count without requiring a local tokenizer."""
        if not text:
            return 0

        words = text.split()
        if not words:
            return 0

        character_estimate = max(1, len(text) // 4)
        word_estimate = max(1, len(words))

        return max(character_estimate, word_estimate)

    def count_messages(
        self,
        messages: list[dict[str, Any]],
    ) -> int:
        """Estimate tokens across chat messages."""
        total = 0

        for message in messages:
            content = message.get("content", "")

            if isinstance(content, str):
                total += self.count_text(content)
            elif content is not None:
                total += self.count_text(str(content))

            total += 4

        return total

    def estimate_output_tokens(
        self,
        text: str,
    ) -> int:
        """Estimate generated tokens from response text."""
        return self.count_text(text)


__all__ = ["DeepSeekTokenizer"]
