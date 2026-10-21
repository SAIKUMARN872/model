"""Accuracy scorer with explicit metric selection."""
from ai.evaluation.accuracy.accuracy import evaluate_accuracy


class AccuracyScorer:
    """Score predictions using supported reference-based metrics."""

    SUPPORTED_METRICS = {"exact_match", "token_f1"}

    def score(self, prediction: str, reference: str, metric: str = "exact_match") -> float:
        if metric not in self.SUPPORTED_METRICS:
            raise ValueError(f"Unsupported accuracy metric: {metric}")
        result = evaluate_accuracy(prediction, reference)
        return float(result[metric])

    def score_batch(self, predictions, references, metric: str = "exact_match") -> list[float]:
        if metric not in self.SUPPORTED_METRICS:
            raise ValueError(f"Unsupported accuracy metric: {metric}")
        if isinstance(predictions, (str, bytes)) or isinstance(references, (str, bytes)):
            raise ValueError("predictions and references must be sequences")
        if len(predictions) != len(references):
            raise ValueError("predictions and references must have equal lengths")
        return [self.score(p, r, metric) for p, r in zip(predictions, references)]
