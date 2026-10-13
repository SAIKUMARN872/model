from __future__ import annotations

import math
from collections.abc import Iterable

from .utils import normalize_relevant_ids, unique_ids, validate_k


def precision_at_k(
    retrieved_ids: Iterable[str],
    relevant_ids: Iterable[str],
    k: int | None = None,
) -> float:
    retrieved = unique_ids(retrieved_ids)
    relevant = normalize_relevant_ids(relevant_ids)
    k = validate_k(k)
    selected = retrieved if k is None else retrieved[:k]

    if not selected:
        return 0.0

    return sum(item in relevant for item in selected) / len(selected)


def recall_at_k(
    retrieved_ids: Iterable[str],
    relevant_ids: Iterable[str],
    k: int | None = None,
) -> float:
    retrieved = unique_ids(retrieved_ids)
    relevant = normalize_relevant_ids(relevant_ids)
    k = validate_k(k)

    if not relevant:
        return 0.0

    selected = retrieved if k is None else retrieved[:k]
    return sum(item in relevant for item in selected) / len(relevant)


def reciprocal_rank(
    retrieved_ids: Iterable[str],
    relevant_ids: Iterable[str],
    k: int | None = None,
) -> float:
    retrieved = unique_ids(retrieved_ids)
    relevant = normalize_relevant_ids(relevant_ids)
    k = validate_k(k)
    selected = retrieved if k is None else retrieved[:k]

    for rank, document_id in enumerate(selected, start=1):
        if document_id in relevant:
            return 1.0 / rank

    return 0.0


def ndcg_at_k(
    retrieved_ids: Iterable[str],
    relevant_ids: Iterable[str],
    k: int | None = None,
) -> float:
    retrieved = unique_ids(retrieved_ids)
    relevant = normalize_relevant_ids(relevant_ids)
    k = validate_k(k)
    selected = retrieved if k is None else retrieved[:k]

    if not relevant or not selected:
        return 0.0

    dcg = sum(
        1.0 / math.log2(rank + 1)
        for rank, document_id in enumerate(selected, start=1)
        if document_id in relevant
    )

    ideal_count = min(len(relevant), len(selected))
    ideal_dcg = sum(
        1.0 / math.log2(rank + 1)
        for rank in range(1, ideal_count + 1)
    )

    return dcg / ideal_dcg if ideal_dcg else 0.0


def calculate_retrieval_metrics(
    retrieved_ids: Iterable[str],
    relevant_ids: Iterable[str],
    k: int | None = None,
) -> dict[str, float]:
    retrieved = unique_ids(retrieved_ids)
    relevant = normalize_relevant_ids(relevant_ids)

    return {
        "precision": precision_at_k(retrieved, relevant, k),
        "recall": recall_at_k(retrieved, relevant, k),
        "mrr": reciprocal_rank(retrieved, relevant, k),
        "ndcg": ndcg_at_k(retrieved, relevant, k),
    }
