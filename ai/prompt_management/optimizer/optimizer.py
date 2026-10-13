from __future__ import annotations

from .rewriter import PromptRewriter, RewriteResult
from .token_optimizer import TokenOptimizationResult, TokenOptimizer


class PromptOptimizer:
    """Provider-neutral prompt cleanup and estimated token reporting."""

    def __init__(self) -> None:
        self._rewriter = PromptRewriter()
        self._token_optimizer = TokenOptimizer(self._rewriter)

    def rewrite(self, prompt: str) -> RewriteResult:
        return self._rewriter.rewrite(prompt)

    def optimize(self, prompt: str) -> TokenOptimizationResult:
        return self._token_optimizer.optimize(prompt)

    def optimize_text(self, prompt: str) -> str:
        return self.optimize(prompt).optimized_prompt


def optimize_prompt(prompt: str) -> TokenOptimizationResult:
    return PromptOptimizer().optimize(prompt)
