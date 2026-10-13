"""Reference-based accuracy metrics for ModelNow."""
from collections.abc import Sequence
from ai.evaluation.utils import exact_match, token_f1


def _validate_text(value, name):
    if not isinstance(value, str):
        raise ValueError(f"{name} must be a string")
    return value


def exact_match_score(prediction: str, reference: str) -> float:
    """Return 1.0 for a normalized exact match, otherwise 0.0."""
    _validate_text(prediction, "prediction")
    _validate_text(reference, "reference")
    return float(exact_match(prediction, reference))


def token_f1_score(prediction: str, reference: str) -> float:
    """Return token-overlap F1 for a prediction and reference."""
    _validate_text(prediction, "prediction")
    _validate_text(reference, "reference")
    return float(token_f1(prediction, reference))


def accuracy_rate(predictions: Sequence[str], references: Sequence[str]) -> float:
    """Return the fraction of predictions that exactly match references."""
    if isinstance(predictions, (str, bytes)) or isinstance(references, (str, bytes)):
        raise ValueError("predictions and references must be sequences of strings")
    if len(predictions) != len(references):
        raise ValueError("predictions and references must have equal lengths")
    if not predictions:
        raise ValueError("at least one prediction is required")
    return sum(
        exact_match_score(p, r) for p, r in zip(predictions, references)
    ) / len(predictions)


def mean_token_f1(predictions: Sequence[str], references: Sequence[str]) -> float:
    """Return mean token F1 across aligned prediction/reference pairs."""
    if isinstance(predictions, (str, bytes)) or isinstance(references, (str, bytes)):
        raise ValueError("predictions and references must be sequences of strings")
    if len(predictions) != len(references):
        raise ValueError("predictions and references must have equal lengths")
    if not predictions:
        raise ValueError("at least one prediction is required")
    scores = [token_f1_score(p, r) for p, r in zip(predictions, references)]
    return sum(scores) / len(scores)
