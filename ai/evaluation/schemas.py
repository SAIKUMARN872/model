"""Evaluation input validation."""
import math
from .exceptions import EvaluationValidationError
from .models import EvaluationCase

def validate_case(case: EvaluationCase) -> EvaluationCase:
    if not isinstance(case, EvaluationCase):
        raise EvaluationValidationError("case must be an EvaluationCase.")

    for name, value in (
        ("case_id", case.case_id),
        ("model_name", case.model_name),
        ("answer", case.answer),
    ):
        if not isinstance(value, str) or not value.strip():
            raise EvaluationValidationError(f"{name} must be non-empty.")

    for name, value in (
        ("reference_answer", case.reference_answer),
        ("context", case.context),
    ):
        if value is not None and not isinstance(value, str):
            raise EvaluationValidationError(f"{name} must be a string or None.")

    for name, value in (
        ("latency_ms", case.latency_ms),
        ("cost_usd", case.cost_usd),
    ):
        if value is not None:
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise EvaluationValidationError(f"{name} must be a finite non-negative number.")
            if not math.isfinite(value) or value < 0:
                raise EvaluationValidationError(f"{name} must be a finite non-negative number.")

    for name, value in (
        ("input_tokens", case.input_tokens),
        ("output_tokens", case.output_tokens),
    ):
        if value is not None and (
            isinstance(value, bool) or not isinstance(value, int) or value < 0
        ):
            raise EvaluationValidationError(f"{name} must be a non-negative integer.")

    if not isinstance(case.metadata, dict):
        raise EvaluationValidationError("metadata must be a dictionary.")
    return case
