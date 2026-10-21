"""Heuristic claim detection for hallucination evaluation."""

import re
from collections import Counter
from typing import Any


_NEGATIONS = {"not", "no", "never", "neither", "without", "cannot", "n't"}


def tokenize(text: str) -> list[str]:
    if not isinstance(text, str):
        raise TypeError("text must be a string")
    return re.findall(r"\b[\w'-]+\b", text.casefold())


def split_claims(answer: str) -> list[str]:
    """Split an answer into sentence-like claims."""
    if not isinstance(answer, str):
        raise TypeError("answer must be a string")
    if not answer.strip():
        raise ValueError("answer must not be empty")

    claims = [
        part.strip()
        for part in re.split(r"(?<=[.!?])\s+|\n+", answer.strip())
        if part.strip()
    ]
    return claims


def token_coverage(claim: str, context: str) -> float:
    """Return the fraction of claim tokens found in context."""
    claim_tokens = tokenize(claim)
    context_tokens = set(tokenize(context))
    if not claim_tokens:
        return 0.0
    return sum(token in context_tokens for token in claim_tokens) / len(claim_tokens)


def has_possible_negation_conflict(claim: str, context: str) -> bool:
    """Flag possible polarity conflicts when shared content words exist.

    This is a weak heuristic. It does not perform natural-language inference.
    """
    claim_tokens = tokenize(claim)
    context_tokens = tokenize(context)

    claim_negated = any(token in _NEGATIONS for token in claim_tokens)
    context_negated = any(token in _NEGATIONS for token in context_tokens)

    claim_content = set(claim_tokens) - _NEGATIONS
    context_content = set(context_tokens) - _NEGATIONS
    shared_content = claim_content & context_content

    return bool(shared_content) and claim_negated != context_negated


def detect_claims(answer: str, context: str) -> list[dict[str, Any]]:
    """Label each claim as supported, unsupported, or possible contradiction.

    Labels are heuristic classifications based on token overlap and negation.
    """
    if not isinstance(context, str):
        raise TypeError("context must be a string")
    if not context.strip():
        raise ValueError("context must not be empty")

    results = []
    for claim in split_claims(answer):
        coverage = token_coverage(claim, context)
        conflict = has_possible_negation_conflict(claim, context)

        if conflict:
            label = "possible_contradiction"
        elif coverage >= 0.6:
            label = "supported_overlap"
        else:
            label = "unsupported_or_unclear"

        results.append({
            "claim": claim,
            "label": label,
            "token_coverage": round(coverage, 4),
            "possible_negation_conflict": conflict,
        })

    return results
