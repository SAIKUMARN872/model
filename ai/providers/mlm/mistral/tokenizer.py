from __future__ import annotations

import re


class MistralTokenizer:
    def __init__(self, model_id: str = "mistral") -> None:
        self.model_id = model_id

    def count_text(self, text: str) -> int:
        if not text:
            return 0
        words = len(re.findall(r"\S+", text))
        chars = len(text)
        return max(words, round(chars / 4))

    def count_messages(self, messages) -> int:
        return sum(
            self.count_text(message.content)
            for message in messages
            if message.content
        )

    def estimate_output_tokens(self, text: str) -> int:
        return self.count_text(text)
