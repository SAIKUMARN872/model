from __future__ import annotations

import math
import re
from collections.abc import Iterable


def normalize_score(value: float) -> float:
    """Clamp a numeric quality value into 0..1."""
    value = float(value)

    if math.isnan(value):
        return 0.0

    if math.isinf(value):
        return 1.0 if value > 0 else 0.0

    return max(0.0, min(1.0, value))


def text_length(text: str | None) -> int:
    """Return normalized text length."""
    if text is None:
        return 0

    return len(str(text).strip())


def word_count(text: str | None) -> int:
    """Return the number of whitespace-delimited words."""
    if not text:
        return 0

    return len(re.findall(r"\S+", str(text)))


def sentence_count(text: str | None) -> int:
    """Estimate sentence count from terminal punctuation."""
    if not text or not str(text).strip():
        return 0

    sentences = re.findall(
        r"[^.!?]+(?:[.!?]+|$)",
        str(text).strip(),
    )

    return len(
        [sentence for sentence in sentences if sentence.strip()]
    )


def token_overlap(
    reference: str | None,
    response: str | None,
) -> float:
    """Calculate token-set overlap between reference and response."""
    reference_tokens = set(_tokens(reference))
    response_tokens = set(_tokens(response))

    if not reference_tokens:
        return 0.0

    return normalize_score(
        len(reference_tokens & response_tokens)
        / len(reference_tokens)
    )


def response_coverage(
    required_terms: Iterable[str],
    response: str | None,
) -> float:
    """Measure how many required terms appear in a response."""
    terms = {
        str(term).strip().lower()
        for term in required_terms
        if str(term).strip()
    }

    if not terms:
        return 1.0

    response_text = (
        str(response).strip().lower()
        if response
        else ""
    )

    matched = sum(
        1
        for term in terms
        if term in response_text
    )

    return normalize_score(matched / len(terms))


def completeness_score(
    required_terms: Iterable[str],
    response: str | None,
) -> float:
    """Alias for response coverage used by quality evaluation."""
    return response_coverage(
        required_terms,
        response,
    )


def latency_score(
    latency_ms: float,
    target_latency_ms: float,
) -> float:
    """Convert observed latency into a normalized quality signal."""
    latency = float(latency_ms)
    target = float(target_latency_ms)

    if latency < 0:
        raise ValueError(
            "latency_ms cannot be negative"
        )

    if target <= 0:
        raise ValueError(
            "target_latency_ms must be greater than zero"
        )

    if latency <= target:
        return 1.0

    return normalize_score(target / latency)


def cost_efficiency_score(
    cost: float,
    target_cost: float,
) -> float:
    """Convert observed cost into a normalized efficiency signal."""
    observed = float(cost)
    target = float(target_cost)

    if observed < 0:
        raise ValueError(
            "cost cannot be negative"
        )

    if target <= 0:
        raise ValueError(
            "target_cost must be greater than zero"
        )

    if observed <= target:
        return 1.0

    return normalize_score(target / observed)


def _tokens(text: str | None) -> list[str]:
    if not text:
        return []

    return re.findall(
        r"\b[\w'-]+\b",
        str(text).lower(),
    )


__all__ = [
    "completeness_score",
    "cost_efficiency_score",
    "latency_score",
    "normalize_score",
    "response_coverage",
    "sentence_count",
    "text_length",
    "token_overlap",
    "word_count",
]
