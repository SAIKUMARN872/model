from __future__ import annotations

from typing import Any


class CohereTokenizer:
    """
    Local token estimator.

    This is intentionally approximate. Authoritative token counts
    must come from Cohere's API usage response.
    """

    @staticmethod
    def count_tokens(text: str) -> int:
        if not text:
            return 0

        return max(
            1,
            len(text) // 4,
        )

    @staticmethod
    def count_messages(
        messages: list[Any],
    ) -> int:
        total = 0

        for message in messages:
            if hasattr(message, "content"):
                content = message.content
            elif isinstance(message, dict):
                content = message.get(
                    "content",
                    "",
                )
            else:
                content = ""

            if isinstance(content, str):
                total += CohereTokenizer.count_tokens(
                    content
                )

        return total


__all__ = ["CohereTokenizer"]
