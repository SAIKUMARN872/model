"""Public API for ModelNow embedding evaluation."""

from .metrics import (
    cosine_similarity,
    pairwise_cosine_similarity,
    precision_at_k,
    recall_at_k,
    reciprocal_rank,
    mean_reciprocal_rank,
    dcg_at_k,
    ndcg_at_k,
    mean_absolute_error,
    root_mean_squared_error,
    pearson_correlation,
)
from .evaluator import EmbeddingEvaluator
from .benchmarks import benchmark_embeddings

__all__ = [
    "cosine_similarity", "pairwise_cosine_similarity",
    "precision_at_k", "recall_at_k", "reciprocal_rank",
    "mean_reciprocal_rank", "dcg_at_k", "ndcg_at_k",
    "mean_absolute_error", "root_mean_squared_error",
    "pearson_correlation", "EmbeddingEvaluator", "benchmark_embeddings",
]
