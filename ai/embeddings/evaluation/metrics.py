"""
Evaluation metrics for ModelNow.

This module contains reusable metrics for:
- classification
- retrieval
- generation
- embeddings
- text similarity
"""

from __future__ import annotations

import math
import re
from collections import Counter
from typing import Any, Iterable


def _tokenize(text: str) -> list[str]:
    """Simple normalized tokenizer."""

    return re.findall(
        r"\b\w+\b",
        str(text).lower(),
    )


def exact_match(
    prediction: Any,
    reference: Any,
) -> float:
    """
    Exact match score.

    Returns:
        1.0 when values match, otherwise 0.0.
    """

    if isinstance(
        prediction,
        str,
    ) and isinstance(
        reference,
        str,
    ):

        return float(
            prediction.strip().lower()
            == reference.strip().lower()
        )

    return float(
        prediction == reference
    )


def accuracy(
    predictions: Iterable[Any],
    references: Iterable[Any],
) -> float:
    """Calculate classification accuracy."""

    predictions = list(predictions)
    references = list(references)

    if len(predictions) != len(references):

        raise ValueError(
            "Predictions and references must "
            "have the same length"
        )

    if not references:
        return 0.0

    correct = sum(
        prediction == reference
        for prediction, reference
        in zip(
            predictions,
            references,
        )
    )

    return correct / len(references)


def precision(
    predictions: Iterable[Any],
    references: Iterable[Any],
    positive_label: Any = 1,
) -> float:
    """Calculate binary precision."""

    predictions = list(predictions)
    references = list(references)

    if len(predictions) != len(references):

        raise ValueError(
            "Predictions and references must "
            "have the same length"
        )

    true_positive = 0
    false_positive = 0

    for prediction, reference in zip(
        predictions,
        references,
    ):

        if prediction == positive_label:

            if reference == positive_label:
                true_positive += 1

            else:
                false_positive += 1

    denominator = (
        true_positive
        + false_positive
    )

    if denominator == 0:
        return 0.0

    return (
        true_positive / denominator
    )


def recall(
    predictions: Iterable[Any],
    references: Iterable[Any],
    positive_label: Any = 1,
) -> float:
    """Calculate binary recall."""

    predictions = list(predictions)
    references = list(references)

    if len(predictions) != len(references):

        raise ValueError(
            "Predictions and references must "
            "have the same length"
        )

    true_positive = 0
    false_negative = 0

    for prediction, reference in zip(
        predictions,
        references,
    ):

        if reference == positive_label:

            if prediction == positive_label:
                true_positive += 1

            else:
                false_negative += 1

    denominator = (
        true_positive
        + false_negative
    )

    if denominator == 0:
        return 0.0

    return (
        true_positive / denominator
    )


def f1_score(
    predictions: Iterable[Any],
    references: Iterable[Any],
    positive_label: Any = 1,
) -> float:
    """Calculate binary F1 score."""

    p = precision(
        predictions,
        references,
        positive_label,
    )

    r = recall(
        predictions,
        references,
        positive_label,
    )

    if p + r == 0:
        return 0.0

    return (
        2 * p * r
    ) / (
        p + r
    )


def jaccard_similarity(
    text_a: str,
    text_b: str,
) -> float:
    """
    Token-level Jaccard similarity.
    """

    tokens_a = set(
        _tokenize(text_a)
    )

    tokens_b = set(
        _tokenize(text_b)
    )

    if not tokens_a and not tokens_b:
        return 1.0

    union = (
        tokens_a | tokens_b
    )

    if not union:
        return 0.0

    intersection = (
        tokens_a & tokens_b
    )

    return len(intersection) / len(union)


def cosine_similarity(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:
    """
    Calculate cosine similarity between vectors.
    """

    a = [
        float(x)
        for x in vector_a
    ]

    b = [
        float(x)
        for x in vector_b
    ]

    if len(a) != len(b):

        raise ValueError(
            "Vectors must have equal dimensions"
        )

    if not a:

        raise ValueError(
            "Vectors cannot be empty"
        )

    dot = sum(
        x * y
        for x, y in zip(a, b)
    )

    norm_a = math.sqrt(
        sum(x * x for x in a)
    )

    norm_b = math.sqrt(
        sum(y * y for y in b)
    )

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot / (
        norm_a * norm_b
    )


def mean_cosine_similarity(
    predictions: Iterable[Iterable[float]],
    references: Iterable[Iterable[float]],
) -> float:
    """Calculate mean cosine similarity."""

    predictions = list(predictions)
    references = list(references)

    if len(predictions) != len(references):

        raise ValueError(
            "Predictions and references must "
            "have the same length"
        )

    if not predictions:
        return 0.0

    scores = [
        cosine_similarity(
            prediction,
            reference,
        )
        for prediction, reference
        in zip(
            predictions,
            references,
        )
    ]

    return sum(scores) / len(scores)


def precision_at_k(
    retrieved: list[Any],
    relevant: set[Any],
    k: int,
) -> float:
    """
    Precision@K for retrieval.
    """

    if k <= 0:
        raise ValueError(
            "k must be greater than zero"
        )

    if not retrieved:
        return 0.0

    selected = retrieved[
        :k
    ]

    relevant_count = sum(
        item in relevant
        for item in selected
    )

    return (
        relevant_count
        / len(selected)
    )


def recall_at_k(
    retrieved: list[Any],
    relevant: set[Any],
    k: int,
) -> float:
    """
    Recall@K for retrieval.
    """

    if k <= 0:
        raise ValueError(
            "k must be greater than zero"
        )

    if not relevant:
        return 0.0

    selected = retrieved[
        :k
    ]

    relevant_count = sum(
        item in relevant
        for item in selected
    )

    return (
        relevant_count
        / len(relevant)
    )


def reciprocal_rank(
    retrieved: list[Any],
    relevant: set[Any],
) -> float:
    """
    Mean Reciprocal Rank for one query.
    """

    for index, item in enumerate(
        retrieved,
        start=1,
    ):

        if item in relevant:

            return 1.0 / index

    return 0.0


def rouge_like_recall(
    prediction: str,
    reference: str,
) -> float:
    """
    Lightweight unigram recall metric.

    This is intentionally dependency-free and is not
    intended to replace a full ROUGE implementation.
    """

    prediction_tokens = _tokenize(
        prediction
    )

    reference_tokens = _tokenize(
        reference
    )

    if not reference_tokens:
        return 0.0

    prediction_counts = Counter(
        prediction_tokens
    )

    reference_counts = Counter(
        reference_tokens
    )

    overlap = 0

    for token, count in reference_counts.items():

        overlap += min(
            count,
            prediction_counts.get(
                token,
                0,
            ),
        )

    return (
        overlap
        / len(reference_tokens)
    )


def word_count(
    text: str,
) -> int:
    """Return the number of words."""

    return len(
        _tokenize(text)
    )


def length_ratio(
    prediction: str,
    reference: str,
) -> float:
    """Compare prediction length to reference length."""

    prediction_length = word_count(
        prediction
    )

    reference_length = word_count(
        reference
    )

    if reference_length == 0:
        return 0.0

    return (
        prediction_length
        / reference_length
    )