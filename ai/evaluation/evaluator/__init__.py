"""
Evaluation engine package.
"""

from .evaluator import (
    EvaluationItemResult,
    EvaluationResult,
    Evaluator,
)

from .pipeline import (
    EvaluationPipeline,
    PipelineResult,
)

from .runner import (
    EvaluationRunner,
    RunnerConfig,
)

from .utils import (
    flatten_metadata,
    normalize_score,
    percentage,
    safe_average,
)


__all__ = [
    "EvaluationItemResult",
    "EvaluationResult",
    "Evaluator",
    "EvaluationPipeline",
    "PipelineResult",
    "EvaluationRunner",
    "RunnerConfig",
    "safe_average",
    "percentage",
    "normalize_score",
    "flatten_metadata",
]