from __future__ import annotations

import re


_TOKEN_PATTERN = re.compile(
    r"\w+|[^\w\s]",
    re.UNICODE,
)


class OpenRouterTokenizer:
    """
    Lightweight tokenizer approximation.

    OpenRouter serves many different underlying tokenizers, so there
    is no single tokenizer that is correct for every routed model.
    This class intentionally provides a deterministic estimate for
    routing/cost decisions when an exact provider tokenizer is not
    available.
    """

    def __init__(
        self,
        model: str,
    ) -> None:
        self.model = model

    def encode(
        self,
        text: str,
    ) -> list[str]:
        if not text:
            return []

        return _TOKEN_PATTERN.findall(text)

    def count_text(
        self,
        text: str,
    ) -> int:
        return len(self.encode(text))

    def count_messages(
        self,
        messages,
    ) -> int:
        total = 0

        for message in messages:
            total += 4
            total += self.count_text(
                str(message.content)
            )

            if getattr(message, "name", None):
                total += self.count_text(
                    str(message.name)
                )

        return total + 2
