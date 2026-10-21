"""Shared ModelNow evaluation engine."""
from collections.abc import Sequence
from .exceptions import EvaluationValidationError
from .models import EvaluationCase, EvaluationResult, ModelEvaluationSummary
from .schemas import validate_case
from .utils import exact_match, lexical_context_overlap, mean, token_f1

class EvaluationEngine:
    """Evaluate reference-based quality and supplied performance measurements.

    Lexical context overlap is a signal, not proof of factual grounding.
    """

    def evaluate(self, case: EvaluationCase) -> EvaluationResult:
        validate_case(case)
        metrics = {
            "latency_ms": case.latency_ms,
            "cost_usd": case.cost_usd,
            "input_tokens": case.input_tokens,
            "output_tokens": case.output_tokens,
            "total_tokens": (
                case.input_tokens + case.output_tokens
                if case.input_tokens is not None and case.output_tokens is not None
                else None
            ),
        }
        signals = []
        if case.reference_answer is not None:
            match = exact_match(case.answer, case.reference_answer)
            f1 = token_f1(case.answer, case.reference_answer)
            metrics["exact_match"] = match
            metrics["token_f1"] = f1
            signals.extend([float(match), f1])

        if case.context is not None:
            metrics["lexical_context_overlap"] = lexical_context_overlap(
                case.answer, case.context
            )

        quality = sum(signals) / len(signals) if signals else None
        return EvaluationResult(
            case_id=case.case_id,
            model_name=case.model_name,
            metrics=metrics,
            quality_score=quality,
            metadata=dict(case.metadata),
        )

    def evaluate_batch(self, cases: Sequence[EvaluationCase]) -> list[EvaluationResult]:
        if isinstance(cases, (str, bytes)):
            raise EvaluationValidationError("cases must be a sequence of evaluation cases.")
        return [self.evaluate(case) for case in cases]

    def summarize(self, results: Sequence[EvaluationResult]) -> list[ModelEvaluationSummary]:
        grouped = {}
        for result in results:
            if not isinstance(result, EvaluationResult):
                raise EvaluationValidationError("results must contain EvaluationResult objects.")
            grouped.setdefault(result.model_name, []).append(result)

        summaries = []
        for model_name in sorted(grouped):
            items = grouped[model_name]
            qualities = [x.quality_score for x in items if x.quality_score is not None]
            latencies = [x.metrics["latency_ms"] for x in items if x.metrics.get("latency_ms") is not None]
            costs = [x.metrics["cost_usd"] for x in items if x.metrics.get("cost_usd") is not None]
            input_tokens = [x.metrics["input_tokens"] for x in items if x.metrics.get("input_tokens") is not None]
            output_tokens = [x.metrics["output_tokens"] for x in items if x.metrics.get("output_tokens") is not None]
            summaries.append(ModelEvaluationSummary(
                model_name=model_name,
                case_count=len(items),
                mean_quality_score=mean(qualities),
                mean_latency_ms=mean(latencies),
                total_cost_usd=sum(costs),
                total_input_tokens=sum(input_tokens),
                total_output_tokens=sum(output_tokens),
            ))
        return summaries
