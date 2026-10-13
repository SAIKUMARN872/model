"""Evaluation exceptions."""

class EvaluationError(Exception):
    """Base evaluation error."""

class EvaluationValidationError(EvaluationError, ValueError):
    """Invalid evaluation input."""

class EvaluationConfigurationError(EvaluationError, ValueError):
    """Invalid evaluation configuration."""
