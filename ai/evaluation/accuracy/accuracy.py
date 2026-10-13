"""Task-level accuracy measurements for ModelNow."""
from collections.abc import Sequence

from ai.evaluation.metrics.accuracy import (
    accuracy_rate,
    exact_match_score,
    mean_token_f1,
    token_f1_score,
)


def evaluate_accuracy(prediction: str, reference: str) -> dict:
    """Evaluate one answer against a reference answer."""
    if not isinstance(prediction, str):
        raise ValueError("prediction must be a string")
    if not isinstance(reference, str):
        raise ValueError("reference must be a string")

    exact = exact_match_score(prediction, reference)
    f1 = token_f1_score(prediction, reference)
    return {
        "exact_match": exact,
        "token_f1": f1,
        "accuracy_score": exact,
        "evaluation_method": "reference_based_text_comparison",
    }


def evaluate_accuracy_batch(
    predictions: Sequence[str],
    references: Sequence[str],
) -> dict:
    """Evaluate aligned predictions and references as a batch."""
    if isinstance(predictions, (str, bytes)) or isinstance(references, (str, bytes)):
        raise ValueError("predictions and references must be sequences")
    if len(predictions) != len(references):
        raise ValueError("predictions and references must have equal lengths")
    if not predictions:
        raise ValueError("at least one prediction is required")

    results = [
        evaluate_accuracy(prediction, reference)
        for prediction, reference in zip(predictions, references)
    ]
    return {
        "sample_count": len(results),
        "exact_match_accuracy": accuracy_rate(predictions, references),
        "mean_token_f1": mean_token_f1(predictions, references),
        "results": results,
        "evaluation_method": "reference_based_text_comparison",
    }
