from __future__ import annotations

import re
from dataclasses import dataclass

from .utils import estimate_tokens_from_characters, validate_text


_TOKEN_PATTERN = re.compile(
    r"\w+|[^\w\s]",
    flags=re.UNICODE,
)


@dataclass(frozen=True)
class TokenCount:
    text: str
    tokens: int
    characters: int
    words: int


class Tokenizer:
    """Base tokenizer interface used by the optimization layer."""

    def count(self, text: str) -> int:
        raise NotImplementedError

    def tokenize(self, text: str) -> list[str]:
        raise NotImplementedError


class ApproximateTokenizer(Tokenizer):
    """
    Lightweight tokenizer used when a provider-specific tokenizer
    is unavailable.

    It separates words and punctuation and falls back to a
    character-based estimate for long/unusual text.
    """

    def tokenize(self, text: str) -> list[str]:
        text = validate_text(text)

        if not text:
            return []

        return _TOKEN_PATTERN.findall(text)

    def count(self, text: str) -> int:
        return len(self.tokenize(text))

    def analyze(self, text: str) -> TokenCount:
        text = validate_text(text)

        tokens = self.tokenize(text)
        words = len(re.findall(r"\w+", text, flags=re.UNICODE))

        return TokenCount(
            text=text,
            tokens=len(tokens),
            characters=len(text),
            words=words,
        )


class CharacterRatioTokenizer(Tokenizer):
    """
    Very lightweight fallback tokenizer.

    Estimates tokens from character count when an actual tokenizer
    is unavailable.
    """

    def __init__(self, characters_per_token: int = 4) -> None:
        if characters_per_token <= 0:
            raise ValueError("characters_per_token must be greater than zero")

        self.characters_per_token = characters_per_token

    def tokenize(self, text: str) -> list[str]:
        text = validate_text(text)

        estimated = self.count(text)

        if estimated == 0:
            return []

        return [text] * estimated

    def count(self, text: str) -> int:
        text = validate_text(text)

        return estimate_tokens_from_characters(
            len(text),
            self.characters_per_token,
        )


class ModelTokenizer:
    """
    Adapter for model/provider-specific tokenizers.

    The callable must accept text and return a non-negative integer.
    """

    def __init__(self, counter) -> None:
        if not callable(counter):
            raise TypeError("counter must be callable")

        self._counter = counter

    def tokenize(self, text: str) -> list[str]:
        text = validate_text(text)

        count = self.count(text)

        return [text] * count if count else []

    def count(self, text: str) -> int:
        text = validate_text(text)

        result = self._counter(text)

        if not isinstance(result, int):
            raise TypeError("token counter must return an integer")

        if result < 0:
            raise ValueError("token counter cannot return a negative value")

        return result


def create_default_tokenizer() -> ApproximateTokenizer:
    return ApproximateTokenizer()


__all__ = [
    "TokenCount",
    "Tokenizer",
    "ApproximateTokenizer",
    "CharacterRatioTokenizer",
    "ModelTokenizer",
    "create_default_tokenizer",
]
