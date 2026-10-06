from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .compressor import (
    PromptCompressor,
)
from .rewriter import (
    PromptRewriter,
)
from .utils import (
    calculate_reduction,
    calculate_reduction_percent,
    calculate_reduction_ratio,
    estimate_tokens,
)


@dataclass(frozen=True)
class PromptOptimizationResult:
    original_prompt: str
    optimized_prompt: str
    original_characters: int
    optimized_characters: int
    original_tokens: int
    optimized_tokens: int
    characters_saved: int
    tokens_saved: int
    reduction_ratio: Decimal
    reduction_percent: Decimal
    rewritten: bool
    compressed: bool
    changed: bool


class PromptOptimizer:
    def __init__(
        self,
        *,
        rewriter: PromptRewriter | None = None,
        compressor: PromptCompressor | None = None,
        characters_per_token: float = 4.0,
        minimum_reduction_percent: float = 1.0,
    ) -> None:
        if characters_per_token <= 0:
            raise ValueError(
                "characters_per_token must be greater than zero"
            )

        if minimum_reduction_percent < 0:
            raise ValueError(
                "minimum_reduction_percent must be non-negative"
            )

        self.rewriter = rewriter or PromptRewriter()
        self.compressor = compressor or PromptCompressor()
        self.characters_per_token = characters_per_token
        self.minimum_reduction_percent = Decimal(
            str(minimum_reduction_percent)
        )

    def optimize(
        self,
        prompt: str,
    ) -> PromptOptimizationResult:
        if not isinstance(prompt, str):
            raise TypeError("prompt must be a string")

        original = prompt
        current = prompt

        rewrite_result = self.rewriter.rewrite(current)

        if rewrite_result.changed:
            current = rewrite_result.rewritten_prompt

        rewritten = rewrite_result.changed

        compression_result = self.compressor.compress(current)

        if compression_result.changed:
            current = compression_result.compressed_prompt

        compressed = compression_result.changed

        original_characters = len(original)
        optimized_characters = len(current)

        original_tokens = estimate_tokens(
            original,
            self.characters_per_token,
        )

        optimized_tokens = estimate_tokens(
            current,
            self.characters_per_token,
        )

        characters_saved = calculate_reduction(
            original_characters,
            optimized_characters,
        )

        tokens_saved = calculate_reduction(
            original_tokens,
            optimized_tokens,
        )

        reduction_ratio = calculate_reduction_ratio(
            original_characters,
            optimized_characters,
        )

        reduction_percent = calculate_reduction_percent(
            original_characters,
            optimized_characters,
        )

        return PromptOptimizationResult(
            original_prompt=original,
            optimized_prompt=current,
            original_characters=original_characters,
            optimized_characters=optimized_characters,
            original_tokens=original_tokens,
            optimized_tokens=optimized_tokens,
            characters_saved=characters_saved,
            tokens_saved=tokens_saved,
            reduction_ratio=reduction_ratio,
            reduction_percent=reduction_percent,
            rewritten=rewritten,
            compressed=compressed,
            changed=original != current,
        )

    def optimize_if_beneficial(
        self,
        prompt: str,
    ) -> PromptOptimizationResult:
        result = self.optimize(prompt)

        if (
            not result.changed
            or result.reduction_percent
            < self.minimum_reduction_percent
        ):
            original_characters = len(result.original_prompt)
            original_tokens = estimate_tokens(
                result.original_prompt,
                self.characters_per_token,
            )

            return PromptOptimizationResult(
                original_prompt=result.original_prompt,
                optimized_prompt=result.original_prompt,
                original_characters=original_characters,
                optimized_characters=original_characters,
                original_tokens=original_tokens,
                optimized_tokens=original_tokens,
                characters_saved=0,
                tokens_saved=0,
                reduction_ratio=Decimal("0"),
                reduction_percent=Decimal("0"),
                rewritten=False,
                compressed=False,
                changed=False,
            )

        return result

    def should_optimize(
        self,
        prompt: str,
    ) -> bool:
        if not isinstance(prompt, str):
            raise TypeError("prompt must be a string")

        result = self.optimize(prompt)

        return (
            result.changed
            and result.reduction_percent
            >= self.minimum_reduction_percent
        )


def create_default_optimizer(
    *,
    characters_per_token: float = 4.0,
    minimum_reduction_percent: float = 1.0,
) -> PromptOptimizer:
    return PromptOptimizer(
        characters_per_token=characters_per_token,
        minimum_reduction_percent=minimum_reduction_percent,
    )


__all__ = [
    "PromptOptimizationResult",
    "PromptOptimizer",
    "create_default_optimizer",
]
