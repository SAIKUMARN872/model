from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Mapping


@dataclass(frozen=True)
class TokenCount:
    """Token estimation result."""

    input_tokens: int
    output_tokens: int = 0

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens


class TokenCounter:
    """
    Lightweight token counter.

    This class intentionally does not depend on a specific tokenizer.
    Production implementations can plug in tiktoken, SentencePiece,
    provider-specific tokenizers, etc.
    """

    DEFAULT_CHARS_PER_TOKEN = 4.0

    def __init__(
        self,
        chars_per_token: float = DEFAULT_CHARS_PER_TOKEN,
    ) -> None:

        if chars_per_token <= 0:
            raise ValueError(
                "chars_per_token must be greater than zero"
            )

        self.chars_per_token = chars_per_token

    def count_text(self, text: str) -> int:
        """Estimate tokens from text."""

        if not text:
            return 0

        return max(
            1,
            int(
                len(text) / self.chars_per_token
            ),
        )

    def count_messages(
        self,
        messages: Iterable[Mapping[str, Any]],
    ) -> int:
        """
        Estimate tokens for chat messages.

        A small per-message overhead is included.
        """

        total = 0

        for message in messages:

            total += 4

            for key, value in message.items():

                if value is None:
                    continue

                total += self.count_text(
                    str(value)
                )

        return total

    def count_prompt(
        self,
        prompt: str | None = None,
        messages: Iterable[Mapping[str, Any]] | None = None,
    ) -> int:

        if messages is not None:
            return self.count_messages(messages)

        if prompt is not None:
            return self.count_text(prompt)

        return 0

    def estimate_output_tokens(
        self,
        max_output_tokens: int | None = None,
        expected_output: str | None = None,
        default_output_tokens: int = 256,
    ) -> int:

        if expected_output is not None:
            return self.count_text(expected_output)

        if max_output_tokens is not None:
            if max_output_tokens < 0:
                raise ValueError(
                    "max_output_tokens cannot be negative"
                )

            return max_output_tokens

        return default_output_tokens

    def count(
        self,
        prompt: str | None = None,
        messages: Iterable[Mapping[str, Any]] | None = None,
        max_output_tokens: int | None = None,
        expected_output: str | None = None,
    ) -> TokenCount:

        input_tokens = self.count_prompt(
            prompt=prompt,
            messages=messages,
        )

        output_tokens = self.estimate_output_tokens(
            max_output_tokens=max_output_tokens,
            expected_output=expected_output,
        )

        return TokenCount(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
        )