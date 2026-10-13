"""Public API for hallucination evaluation."""

from .checker import HallucinationChecker, check_hallucinations
from .detector import (
    detect_claims,
    has_possible_negation_conflict,
    split_claims,
    token_coverage,
    tokenize,
)
from .metrics import calculate_hallucination_metrics

__all__ = [
    "HallucinationChecker",
    "calculate_hallucination_metrics",
    "check_hallucinations",
    "detect_claims",
    "has_possible_negation_conflict",
    "split_claims",
    "token_coverage",
    "tokenize",
]
