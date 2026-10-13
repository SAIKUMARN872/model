from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .manager import ContextManager, ContextOptimizationResult


@dataclass(frozen=True)
class ContextOptimization:
    original_context: str
    optimized_context: str
    original_characters: int
    optimized_characters: int
    characters_saved: int
    reduction_percent: Decimal
    changed: bool


class ContextOptimizer:
    """High-level optimizer for reducing unnecessary model context."""

    def __init__(
        self,
        *,
        manager: ContextManager | None = None,
        minimum_reduction_percent: float = 1.0,
    ) -> None:
        if minimum_reduction_percent < 0:
            raise ValueError(
                "minimum_reduction_percent must be non-negative"
            )

        self.manager = manager or ContextManager()
        self.minimum_reduction_percent = Decimal(
            str(minimum_reduction_percent)
        )

    def optimize(
        self,
        context: str,
        *,
        max_characters: int | None = None,
        max_tokens: int | None = None,
        summary_threshold: int | None = None,
    ) -> ContextOptimization:
        result = self.manager.optimize(
            context,
            max_characters=max_characters,
            max_tokens=max_tokens,
            summary_threshold=summary_threshold,
        )

        return self._build_result(result)

    def optimize_if_beneficial(
        self,
        context: str,
        *,
        max_characters: int | None = None,
        max_tokens: int | None = None,
        summary_threshold: int | None = None,
    ) -> ContextOptimization:
        result = self.manager.optimize(
            context,
            max_characters=max_characters,
            max_tokens=max_tokens,
            summary_threshold=summary_threshold,
        )

        if (
            not result.changed
            or result.reduction_percent < self.minimum_reduction_percent
        ):
            return ContextOptimization(
                original_context=result.original_context,
                optimized_context=result.original_context,
                original_characters=result.original_characters,
                optimized_characters=result.original_characters,
                characters_saved=0,
                reduction_percent=Decimal("0"),
                changed=False,
            )

        return self._build_result(result)

    def should_optimize(
        self,
        context: str,
        *,
        max_characters: int | None = None,
        max_tokens: int | None = None,
        summary_threshold: int | None = None,
    ) -> bool:
        return self.manager.should_optimize(
            context,
            max_characters=max_characters,
            max_tokens=max_tokens,
            summary_threshold=summary_threshold,
        )

    @staticmethod
    def _build_result(
        result: ContextOptimizationResult,
    ) -> ContextOptimization:
        return ContextOptimization(
            original_context=result.original_context,
            optimized_context=result.optimized_context,
            original_characters=result.original_characters,
            optimized_characters=result.optimized_characters,
            characters_saved=result.characters_saved,
            reduction_percent=result.reduction_percent,
            changed=result.changed,
        )


def create_default_optimizer(
    *,
    minimum_reduction_percent: float = 1.0,
) -> ContextOptimizer:
    """Create the default context optimizer."""
    return ContextOptimizer(
        minimum_reduction_percent=minimum_reduction_percent,
    )


__all__ = [
    "ContextOptimization",
    "ContextOptimizer",
    "create_default_optimizer",
]
