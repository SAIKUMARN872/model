"""Response evaluation orchestration for ModelNow."""
from dataclasses import replace
from typing import Any

from ai.evaluation.engine import EvaluationEngine
from ai.evaluation.exceptions import EvaluationValidationError
from ai.evaluation.models import EvaluationCase, EvaluationResult
from ai.evaluation.quality.quality import evaluate_quality
from ai.evaluation.hallucination.checker import check_hallucinations


class ResponseEvaluator:
    """Evaluate an existing model response without calling a model provider.

    Text-overlap metrics are diagnostic signals, not proof of factual truth.
    """

    def __init__(
        self,
        engine: EvaluationEngine | None = None,
        *,
        include_quality: bool = True,
        include_hallucination_check: bool = True,
    ):
        if not isinstance(include_quality, bool):
            raise EvaluationValidationError("include_quality must be a boolean.")
        if not isinstance(include_hallucination_check, bool):
            raise EvaluationValidationError(
                "include_hallucination_check must be a boolean."
            )

        self.engine = engine if engine is not None else EvaluationEngine()
        if not callable(getattr(self.engine, "evaluate", None)):
            raise EvaluationValidationError("engine must provide evaluate(case).")

        self.include_quality = include_quality
        self.include_hallucination_check = include_hallucination_check

    def evaluate(self, case: EvaluationCase) -> EvaluationResult:
        """Evaluate one response and attach available diagnostic metrics."""
        result = self.engine.evaluate(case)
        metrics = dict(result.metrics)
        metadata = dict(result.metadata)

        if self.include_quality and (
            case.reference_answer is not None or (case.context is not None and bool(case.context.strip()))
        ):
            quality = evaluate_quality(
                answer=case.answer,
                reference=case.reference_answer,
                context=case.context if case.context and case.context.strip() else None,
            )
            metrics["quality_heuristic_score"] = quality["quality_score"]
            for name, value in quality["metrics"].items():
                metrics[f"quality_{name}"] = value

            metadata["quality_diagnostics"] = {
                "details": quality["details"],
                "limitations": quality["limitations"],
            }

        if self.include_hallucination_check and case.context and case.context.strip():
            hallucination = check_hallucinations(case.answer, case.context)
            for name, value in hallucination["metrics"].items():
                metrics[f"hallucination_{name}"] = value

            metadata["hallucination_diagnostics"] = {
                "claim_count": hallucination["claim_count"],
                "claims": hallucination["claims"],
                "limitations": hallucination["limitations"],
            }

        return replace(result, metrics=metrics, metadata=metadata)

    def evaluate_batch(self, cases) -> list[EvaluationResult]:
        """Evaluate a batch; fail clearly on invalid inputs."""
        if isinstance(cases, (str, bytes)) or not isinstance(cases, (list, tuple)):
            raise EvaluationValidationError("cases must be a list or tuple.")
        return [self.evaluate(case) for case in cases]


def evaluate_response(case: EvaluationCase) -> EvaluationResult:
    """Convenience function for evaluating a single response."""
    return ResponseEvaluator().evaluate(case)

