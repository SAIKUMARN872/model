from __future__ import annotations

from dataclasses import dataclass

from .rewriter import PromptRewriter
from .utils import estimate_tokens, reduction_percentage, validate_prompt


@dataclass(frozen=True)
class TokenOptimizationResult:
    original_prompt: str
    optimized_prompt: str
    estimated_tokens_before: int
    estimated_tokens_after: int
    estimated_tokens_saved: int
    reduction_percent: float
    transformations: tuple[str, ...]


class TokenOptimizer:
    def __init__(self, rewriter: PromptRewriter | None = None) -> None:
        self._rewriter = rewriter or PromptRewriter()

    def optimize(self, prompt: str) -> TokenOptimizationResult:
        validate_prompt(prompt)
        rewritten = self._rewriter.rewrite(prompt)

        before = estimate_tokens(prompt)
        after = estimate_tokens(rewritten.rewritten_prompt)

        return TokenOptimizationResult(
            original_prompt=prompt,
            optimized_prompt=rewritten.rewritten_prompt,
            estimated_tokens_before=before,
            estimated_tokens_after=after,
            estimated_tokens_saved=max(0, before - after),
            reduction_percent=reduction_percentage(before, after),
            transformations=rewritten.transformations,
        )
