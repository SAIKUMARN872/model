"""Metrics for embedding similarity and information retrieval."""

import math
from .utils import validate_vector, validate_vectors, validate_k, validate_relevance


def cosine_similarity(left, right):
    a, b = validate_vector(left, "left"), validate_vector(right, "right")
    if len(a) != len(b):
        raise ValueError("Vectors must have equal dimensions.")
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        raise ValueError("Cosine similarity is undefined for zero vectors.")
    return max(-1.0, min(1.0, dot / (na * nb)))


def pairwise_cosine_similarity(vectors):
    values = validate_vectors(vectors)
    return [[cosine_similarity(a, b) for b in values] for a in values]


def precision_at_k(retrieved, relevant, k):
    validate_k(k)
    relevant = set(relevant)
    if not relevant:
        raise ValueError("relevant must contain at least one relevant item.")
    top = list(retrieved)[:k]
    return sum(item in relevant for item in top) / k


def recall_at_k(retrieved, relevant, k):
    validate_k(k)
    relevant = set(relevant)
    if not relevant:
        raise ValueError("relevant must contain at least one relevant item.")
    return sum(item in relevant for item in list(retrieved)[:k]) / len(relevant)


def reciprocal_rank(retrieved, relevant):
    relevant = set(relevant)
    if not relevant:
        raise ValueError("relevant must contain at least one relevant item.")
    for rank, item in enumerate(retrieved, start=1):
        if item in relevant:
            return 1.0 / rank
    return 0.0


def mean_reciprocal_rank(rankings, relevant_sets):
    if len(rankings) != len(relevant_sets) or not rankings:
        raise ValueError("rankings and relevant_sets must be non-empty and equal in length.")
    return sum(reciprocal_rank(r, rel) for r, rel in zip(rankings, relevant_sets)) / len(rankings)


def dcg_at_k(relevance, k):
    validate_k(k)
    grades = validate_relevance(relevance)
    return sum((2.0 ** grade - 1.0) / math.log2(rank + 1)
               for rank, grade in enumerate(grades[:k], start=1))


def ndcg_at_k(relevance, k):
    grades = validate_relevance(relevance)
    actual = dcg_at_k(grades, k)
    ideal = dcg_at_k(sorted(grades, reverse=True), k)
    return actual / ideal if ideal else 0.0


def mean_absolute_error(actual, predicted):
    if len(actual) != len(predicted) or not actual:
        raise ValueError("Inputs must be non-empty and equal in length.")
    return sum(abs(float(a) - float(p)) for a, p in zip(actual, predicted)) / len(actual)


def root_mean_squared_error(actual, predicted):
    if len(actual) != len(predicted) or not actual:
        raise ValueError("Inputs must be non-empty and equal in length.")
    return math.sqrt(sum((float(a) - float(p)) ** 2 for a, p in zip(actual, predicted)) / len(actual))


def pearson_correlation(actual, predicted):
    if len(actual) != len(predicted) or len(actual) < 2:
        raise ValueError("Inputs must have equal length and at least two values.")
    x, y = [float(v) for v in actual], [float(v) for v in predicted]
    if not all(math.isfinite(v) for v in x + y):
        raise ValueError("Inputs must contain finite values.")
    mx, my = sum(x) / len(x), sum(y) / len(y)
    dx, dy = [v - mx for v in x], [v - my for v in y]
    denominator = math.sqrt(sum(v*v for v in dx) * sum(v*v for v in dy))
    if denominator == 0:
        raise ValueError("Correlation is undefined for constant inputs.")
    return sum(a*b for a, b in zip(dx, dy)) / denominator
