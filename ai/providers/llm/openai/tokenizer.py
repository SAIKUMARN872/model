from __future__ import annotations

import re


class OpenAITokenizer:
    """Token estimation utility for ModelNow cost and routing decisions."""

    PROVIDER_ID = "openai"

    def __init__(self, model: str | None = None) -> None:
        self.model = model
        self._encoding = None

        try:
            import tiktoken

            if model:
                try:
                    self._encoding = tiktoken.encoding_for_model(
                        model
                    )
                except Exception:
                    self._encoding = tiktoken.get_encoding(
                        "cl100k_base"
                    )
        except ImportError:
            self._encoding = None

    def count_text(self, text: str) -> int:
        if not text:
            return 0

        if self._encoding is not None:
            return len(self._encoding.encode(text))

        # Conservative approximation when tiktoken is unavailable.
        words = re.findall(r"\S+", text)
        characters = len(text)

        return max(
            len(words),
            (characters + 3) // 4,
        )

    def count_messages(self, messages: list[object]) -> int:
        total = 0

        for message in messages:
            if isinstance(message, dict):
                content = message.get("content", "")
            else:
                content = getattr(
                    message,
                    "content",
                    "",
                )

            if isinstance(content, str):
                total += self.count_text(content)

        # Small structural overhead per message.
        return total + (len(messages) * 4)

    def estimate_tokens(self, text: str) -> int:
        return self.count_text(text)


__all__ = ["OpenAITokenizer"]

