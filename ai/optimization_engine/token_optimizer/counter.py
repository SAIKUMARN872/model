from __future__ import annotations

from dataclasses import dataclass

from .tokenizer import (
    Tokenizer,
    create_default_tokenizer,
)
from .utils import (
    calculate_reduction,
    calculate_reduction_percent,
    validate_text,
)


@dataclass(frozen=True)
class TokenStatistics:
    input_tokens: int
    output_tokens: int
    tokens_saved: int
    reduction_percent: float


class TokenCounter:
    """High-level token counting service."""

    def __init__(self, tokenizer: Tokenizer | None = None) -> None:
        self.tokenizer = tokenizer or create_default_tokenizer()

    def count(self, text: str) -> int:
        text = validate_text(text)
        return self.tokenizer.count(text)

    def compare(
        self,
        original_text: str,
        optimized_text: str,
    ) -> TokenStatistics:
        original_text = validate_text(original_text)
        optimized_text = validate_text(optimized_text)

        input_tokens = self.count(original_text)
        output_tokens = self.count(optimized_text)

        tokens_saved = calculate_reduction(
            input_tokens,
            output_tokens,
        )

        reduction_percent = float(
            calculate_reduction_percent(
                input_tokens,
                output_tokens,
            )
        )

        return TokenStatistics(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            tokens_saved=tokens_saved,
            reduction_percent=reduction_percent,
        )

    def estimate_savings(
        self,
        original_text: str,
        optimized_text: str,
    ) -> int:
        original_tokens = self.count(original_text)
        optimized_tokens = self.count(optimized_text)

        return calculate_reduction(
            original_tokens,
            optimized_tokens,
        )


def create_default_counter() -> TokenCounter:
    return TokenCounter()


__all__ = [
    "TokenStatistics",
    "TokenCounter",
    "create_default_counter",
]
