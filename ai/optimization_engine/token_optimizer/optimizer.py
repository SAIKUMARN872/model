from __future__ import annotations

from dataclasses import dataclass

from .compressor import (
    CompressionResult,
    TextCompressor,
    create_default_compressor,
)
from .counter import (
    TokenCounter,
    TokenStatistics,
    create_default_counter,
)
from .reducer import (
    TokenReducer,
    create_default_reducer,
)
from .utils import validate_text


@dataclass(frozen=True)
class TokenOptimizationResult:
    original_text: str
    optimized_text: str
    original_tokens: int
    optimized_tokens: int
    tokens_saved: int
    reduction_percent: float
    changed: bool


class TokenOptimizer:
    """Coordinates token counting and conservative text optimization."""

    def __init__(
        self,
        counter: TokenCounter | None = None,
        reducer: TokenReducer | None = None,
        compressor: TextCompressor | None = None,
    ) -> None:
        self.counter = counter or create_default_counter()
        self.reducer = reducer or create_default_reducer()
        self.compressor = compressor or create_default_compressor()

    def optimize(self, text: str) -> TokenOptimizationResult:
        text = validate_text(text)

        original_tokens = self.counter.count(text)

        compressed: CompressionResult = self.compressor.compress(text)

        optimized_text = compressed.compressed_text

        optimized_tokens = self.counter.count(optimized_text)

        statistics: TokenStatistics = self.counter.compare(
            text,
            optimized_text,
        )

        return TokenOptimizationResult(
            original_text=text,
            optimized_text=optimized_text,
            original_tokens=original_tokens,
            optimized_tokens=optimized_tokens,
            tokens_saved=statistics.tokens_saved,
            reduction_percent=statistics.reduction_percent,
            changed=optimized_text != text,
        )

    def should_optimize(
        self,
        text: str,
        minimum_token_savings: int = 1,
    ) -> bool:
        text = validate_text(text)

        if minimum_token_savings < 0:
            raise ValueError(
                "minimum_token_savings must be non-negative"
            )

        result = self.optimize(text)

        return result.tokens_saved >= minimum_token_savings

    def optimize_if_beneficial(
        self,
        text: str,
        minimum_token_savings: int = 1,
    ) -> str:
        result = self.optimize(text)

        if result.tokens_saved >= minimum_token_savings:
            return result.optimized_text

        return result.original_text


def create_default_token_optimizer() -> TokenOptimizer:
    return TokenOptimizer()


__all__ = [
    "TokenOptimizationResult",
    "TokenOptimizer",
    "create_default_token_optimizer",
]
