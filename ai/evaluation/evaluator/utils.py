"""Small utilities for evaluator result handling."""
from collections.abc import Sequence

from ai.evaluation.exceptions import EvaluationValidationError
from ai.evaluation.models import EvaluationResult


def validate_results(results: Sequence[EvaluationResult]) -> list[EvaluationResult]:
    """Validate a result sequence and return a list copy."""
    if isinstance(results, (str, bytes)) or not isinstance(results, (list, tuple)):
        raise EvaluationValidationError("results must be a list or tuple.")

    for result in results:
        if not isinstance(result, EvaluationResult):
            raise EvaluationValidationError(
                "results must contain only EvaluationResult objects."
            )

    return list(results)


def results_to_dict(results: Sequence[EvaluationResult]) -> list[dict]:
    """Convert results to JSON-friendly dictionaries."""
    validated = validate_results(results)
    return [
        {
            "case_id": result.case_id,
            "model_name": result.model_name,
            "metrics": dict(result.metrics),
            "quality_score": result.quality_score,
            "metadata": dict(result.metadata),
        }
        for result in validated
    ]
