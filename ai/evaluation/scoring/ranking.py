"""Comparison-based ranking API reused by ModelNow scoring."""
from ai.evaluation.comparison.ranking import (
    DEFAULT_WEIGHTS,
    rank_models as rank_models_by_comparison,
)

__all__ = ["DEFAULT_WEIGHTS", "rank_models_by_comparison"]
