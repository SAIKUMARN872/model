"""
ModelNow Evaluation Package.

Provides evaluation metrics, benchmark execution,
model evaluation and reporting.
"""

from .benchmarks import (
    BenchmarkCase,
    BenchmarkReport,
    BenchmarkResult,
    BenchmarkRunner,
    BenchmarkSuite,
)

from .evaluator import (
    EvaluationReport,
    EvaluationSample,
    Evaluator,
    MetricResult,
    SampleEvaluation,
)

from .metrics import (
    accuracy,
    cosine_similarity,
    exact_match,
    f1_score,
    jaccard_similarity,
    length_ratio,
    mean_cosine_similarity,
    precision,
    precision_at_k,
    recall,
    recall_at_k,
    reciprocal_rank,
    rouge_like_recall,
    word_count,
)

from .utils import (
    clamp,
    elapsed_ms,
    normalize_metric_name,
    percentile,
    safe_max,
    safe_mean,
    safe_median,
    safe_min,
    safe_stddev,
    timer_start,
    to_json,
    to_serializable,
    utc_now,
    validate_equal_lengths,
)


__all__ = [
    # Evaluator
    "Evaluator",
    "EvaluationSample",
    "EvaluationReport",
    "SampleEvaluation",
    "MetricResult",

    # Benchmarks
    "BenchmarkCase",
    "BenchmarkResult",
    "BenchmarkReport",
    "BenchmarkSuite",
    "BenchmarkRunner",

    # Metrics
    "accuracy",
    "exact_match",
    "precision",
    "recall",
    "f1_score",
    "jaccard_similarity",
    "cosine_similarity",
    "mean_cosine_similarity",
    "precision_at_k",
    "recall_at_k",
    "reciprocal_rank",
    "rouge_like_recall",
    "word_count",
    "length_ratio",

    # Utilities
    "utc_now",
    "timer_start",
    "elapsed_ms",
    "safe_mean",
    "safe_median",
    "safe_min",
    "safe_max",
    "safe_stddev",
    "percentile",
    "normalize_metric_name",
    "to_serializable",
    "to_json",
    "validate_equal_lengths",
    "clamp",
]


__version__ = "1.0.0"