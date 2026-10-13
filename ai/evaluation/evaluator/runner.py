"""Evaluation runner and report assembly."""
from ai.evaluation.engine import EvaluationEngine
from ai.evaluation.exceptions import EvaluationValidationError
from ai.evaluation.models import EvaluationResult
from ai.evaluation.evaluator.pipeline import EvaluationPipeline


class EvaluationRunner:
    """Run dataset evaluations and return results with model summaries."""

    def __init__(
        self,
        pipeline: EvaluationPipeline | None = None,
        engine: EvaluationEngine | None = None,
    ):
        if pipeline is not None and engine is not None:
            raise EvaluationValidationError(
                "provide pipeline or engine, not both."
            )

        self.engine = engine or EvaluationEngine()
        self.pipeline = pipeline or EvaluationPipeline()

        if not callable(getattr(self.engine, "summarize", None)):
            raise EvaluationValidationError("engine must provide summarize(results).")

    def run(
        self,
        dataset,
        predictions,
        model_name: str,
        measurements=None,
    ) -> dict:
        """Run evaluation and assemble a serializable report."""
        results = self.pipeline.run(
            dataset=dataset,
            predictions=predictions,
            model_name=model_name,
            measurements=measurements,
        )
        summaries = self.engine.summarize(results)

        return {
            "status": "completed",
            "dataset_name": dataset.name,
            "model_name": model_name,
            "case_count": len(results),
            "results": results,
            "summaries": summaries,
            "limitations": [
                "Lexical metrics are not proof of factual correctness.",
                "Hallucination checks are heuristic context-overlap diagnostics.",
                "Only supplied predictions and measurements are evaluated; no provider is called.",
            ],
        }


def run_evaluation(dataset, predictions, model_name: str, measurements=None) -> dict:
    """Convenience entry point for one dataset evaluation."""
    return EvaluationRunner().run(
        dataset=dataset,
        predictions=predictions,
        model_name=model_name,
        measurements=measurements,
    )
