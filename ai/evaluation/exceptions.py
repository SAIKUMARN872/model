"""
Evaluation exceptions.
"""


class EvaluationError(Exception):
    """Base evaluation exception."""


class EvaluationValidationError(
    EvaluationError
):
    """Invalid evaluation request."""


class EvaluationNotFoundError(
    EvaluationError
):
    """Evaluation result not found."""


class EvaluationAlreadyExistsError(
    EvaluationError
):
    """Evaluation already exists."""


class EvaluationAlreadyRunningError(
    EvaluationError
):
    """Evaluation is already running."""


class EvaluationExecutionError(
    EvaluationError
):
    """Evaluation execution failed."""


class MetricError(EvaluationError):
    """Metric calculation error."""


class MetricNotFoundError(MetricError):
    """Metric was not registered."""


class ScoringError(EvaluationError):
    """Scoring error."""


class EvaluationConfigurationError(
    EvaluationError
):
    """Invalid evaluation configuration."""


class ResultStoreError(EvaluationError):
    """Result storage error."""