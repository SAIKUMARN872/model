"""Dataset models and validation for ModelNow evaluation."""
from dataclasses import dataclass, field
from typing import Any

from ai.evaluation.exceptions import EvaluationValidationError


@dataclass(frozen=True)
class DatasetCase:
    """A reusable evaluation input, independent of any particular model."""
    case_id: str
    input_text: str
    reference_answer: str | None = None
    context: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class EvaluationDataset:
    """A named collection of reusable evaluation cases."""
    name: str
    cases: tuple[DatasetCase, ...]
    metadata: dict[str, Any] = field(default_factory=dict)


def validate_dataset_case(case: DatasetCase) -> DatasetCase:
    """Validate one dataset case."""
    if not isinstance(case, DatasetCase):
        raise EvaluationValidationError("case must be a DatasetCase.")

    for field_name, value in (
        ("case_id", case.case_id),
        ("input_text", case.input_text),
    ):
        if not isinstance(value, str) or not value.strip():
            raise EvaluationValidationError(
                f"{field_name} must be a non-empty string."
            )

    for field_name, value in (
        ("reference_answer", case.reference_answer),
        ("context", case.context),
    ):
        if value is not None and not isinstance(value, str):
            raise EvaluationValidationError(
                f"{field_name} must be a string or None."
            )

    if not isinstance(case.metadata, dict):
        raise EvaluationValidationError("case metadata must be a dictionary.")

    return case


def validate_dataset(dataset: EvaluationDataset) -> EvaluationDataset:
    """Validate a dataset and reject duplicate case identifiers."""
    if not isinstance(dataset, EvaluationDataset):
        raise EvaluationValidationError(
            "dataset must be an EvaluationDataset."
        )

    if not isinstance(dataset.name, str) or not dataset.name.strip():
        raise EvaluationValidationError("dataset name must be non-empty.")

    if not isinstance(dataset.cases, tuple):
        raise EvaluationValidationError("dataset cases must be a tuple.")

    if not dataset.cases:
        raise EvaluationValidationError("dataset must contain at least one case.")

    if not isinstance(dataset.metadata, dict):
        raise EvaluationValidationError("dataset metadata must be a dictionary.")

    seen_ids = set()

    for case in dataset.cases:
        validate_dataset_case(case)

        if case.case_id in seen_ids:
            raise EvaluationValidationError(
                f"duplicate case_id: {case.case_id}"
            )

        seen_ids.add(case.case_id)

    return dataset
