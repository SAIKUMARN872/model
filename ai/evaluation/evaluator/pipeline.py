"""Dataset-to-response evaluation pipeline."""
from collections.abc import Mapping

from ai.evaluation.datasets.dataset import (
    EvaluationDataset,
    validate_dataset,
)
from ai.evaluation.exceptions import EvaluationValidationError
from ai.evaluation.models import EvaluationCase, EvaluationResult
from ai.evaluation.evaluator.evaluator import ResponseEvaluator


class EvaluationPipeline:
    """Convert dataset cases and supplied predictions into evaluation results."""

    def __init__(self, evaluator: ResponseEvaluator | None = None):
        self.evaluator = evaluator or ResponseEvaluator()
        if not callable(getattr(self.evaluator, "evaluate_batch", None)):
            raise EvaluationValidationError(
                "evaluator must provide evaluate_batch(cases)."
            )

    def build_cases(
        self,
        dataset: EvaluationDataset,
        predictions,
        model_name: str,
        measurements: Mapping | None = None,
    ) -> list[EvaluationCase]:
        """Build EvaluationCase objects from dataset inputs and model outputs."""
        validate_dataset(dataset)

        if not isinstance(model_name, str) or not model_name.strip():
            raise EvaluationValidationError("model_name must be non-empty.")

        if isinstance(predictions, Mapping):
            expected_ids = {case.case_id for case in dataset.cases}
            actual_ids = set(predictions.keys())
            if actual_ids != expected_ids:
                missing = sorted(expected_ids - actual_ids)
                extra = sorted(actual_ids - expected_ids)
                raise EvaluationValidationError(
                    f"prediction IDs must match dataset IDs; missing={missing}, extra={extra}"
                )
            ordered_predictions = [predictions[case.case_id] for case in dataset.cases]
        elif isinstance(predictions, (list, tuple)):
            if len(predictions) != len(dataset.cases):
                raise EvaluationValidationError(
                    "prediction count must match dataset case count."
                )
            ordered_predictions = list(predictions)
        else:
            raise EvaluationValidationError(
                "predictions must be a list, tuple, or mapping keyed by case_id."
            )

        if measurements is not None and not isinstance(measurements, Mapping):
            raise EvaluationValidationError("measurements must be a mapping or None.")

        built = []
        for dataset_case, answer in zip(dataset.cases, ordered_predictions):
            if not isinstance(answer, str) or not answer.strip():
                raise EvaluationValidationError(
                    f"prediction for case {dataset_case.case_id} must be non-empty text."
                )

            supplied = {}
            if measurements is not None:
                supplied = measurements.get(dataset_case.case_id, {})
                if not isinstance(supplied, Mapping):
                    raise EvaluationValidationError(
                        f"measurements for case {dataset_case.case_id} must be a mapping."
                    )

            allowed_measurements = {
                "latency_ms", "cost_usd", "input_tokens", "output_tokens"
            }
            unknown = set(supplied) - allowed_measurements
            if unknown:
                raise EvaluationValidationError(
                    f"unsupported measurements for case {dataset_case.case_id}: "
                    f"{', '.join(sorted(unknown))}"
                )

            metadata = dict(dataset_case.metadata)
            metadata["dataset_name"] = dataset.name
            metadata["dataset_case_id"] = dataset_case.case_id

            built.append(
                EvaluationCase(
                    case_id=dataset_case.case_id,
                    model_name=model_name,
                    answer=answer,
                    reference_answer=dataset_case.reference_answer,
                    context=dataset_case.context,
                    metadata=metadata,
                    **dict(supplied),
                )
            )

        return built

    def run(
        self,
        dataset: EvaluationDataset,
        predictions,
        model_name: str,
        measurements: Mapping | None = None,
    ) -> list[EvaluationResult]:
        """Build cases and evaluate them as a batch."""
        cases = self.build_cases(
            dataset=dataset,
            predictions=predictions,
            model_name=model_name,
            measurements=measurements,
        )
        return self.evaluator.evaluate_batch(cases)
