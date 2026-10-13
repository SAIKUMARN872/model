from __future__ import annotations

import re

from ai.providers.base.request import ChatMessage


_TOKEN_PATTERN = re.compile(
    r"\w+|[^\w\s]",
    re.UNICODE,
)


class AWSBedrockTokenizer:
    """
    Deterministic approximate tokenizer.

    Bedrock supports model-specific token counting,
    but ModelNow needs a provider-independent fallback
    for routing and estimation when no remote tokenizer
    is available.
    """

    def count_text(
        self,
        text: str,
    ) -> int:
        if not text:
            return 0

        pieces = _TOKEN_PATTERN.findall(
            text
        )

        if not pieces:
            return 0

        return len(pieces)

    def count_message(
        self,
        message: ChatMessage,
    ) -> int:
        return self.count_text(
            str(message.content)
        )

    def count_messages(
        self,
        messages: list[ChatMessage],
    ) -> int:
        return sum(
            self.count_message(message)
            for message in messages
        )

    def encode(
        self,
        text: str,
    ) -> list[str]:
        return _TOKEN_PATTERN.findall(
            text
        )

    def decode(
        self,
        tokens: list[str],
    ) -> str:
        return " ".join(tokens)
