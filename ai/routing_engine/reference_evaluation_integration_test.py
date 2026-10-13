from __future__ import annotations

import asyncio

from ai.inference_engine.backends.transformers import TransformersBackend
from ai.inference_engine.engine import InferenceEngine
from ai.model_registry.engine import ModelRegistryEngine
from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.inference_adapter import RoutingInferenceAdapter
from ai.routing_engine.inference_adapter_test import (
    MockSLMProvider,
    build_registry,
)
from ai.routing_engine.models import RoutingRequest


class FailingEvaluationEngine:
    def evaluate(self, case):
        raise RuntimeError("Simulated supplemental evaluation failure")


async def main() -> None:
    provider = MockSLMProvider()
    backend = TransformersBackend(providers=[provider])
    inference_engine = InferenceEngine(backends=[backend])

    registry: ModelRegistryEngine = build_registry()
    routing_engine = RoutingEngine(registry=registry)

    adapter = RoutingInferenceAdapter(
        routing_engine=routing_engine,
        inference_engine=inference_engine,
    )

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Explain ModelNow routing.",
            }
        ],
        objective=RoutingObjective.COST,
        preferred_tier="slm",
        metadata={
            "request_id": "8b5a1e42-6f37-4a90-9c21-5d7e3b8a1046",
        },
    )

    await inference_engine.initialize()

    try:
        result = await adapter.infer(request)

        assert result.content.strip()
        assert result.model == "mock-slm-model"

        quality = adapter.evaluate_result(
            request,
            result,
            relevance=0.90,
            correctness=0.90,
            completeness=0.85,
            coherence=0.90,
        )
        original_quality_score = quality.score

        # 1. Reference-answer evaluation.
        reference = result.content
        ref_quality, ref_memory, ref_feedback = adapter.record_result(
            request,
            result,
            quality=quality,
            reference=reference,
        )

        ref_metadata = ref_memory.metadata
        ref_evaluation = ref_metadata["reference_evaluation"]

        assert ref_metadata["reference_evaluation_status"] == "completed"
        assert ref_evaluation["quality_score"] == 1.0
        assert ref_evaluation["metrics"]["exact_match"] is True
        assert ref_evaluation["metrics"]["token_f1"] == 1.0
        assert ref_quality.score == original_quality_score
        assert ref_feedback.quality_score == original_quality_score
        assert (
            ref_feedback.metadata["reference_evaluation"]["quality_score"]
            == 1.0
        )
        print("REFERENCE ANSWER EVALUATION: PASS")
        print("ADAPTIVE QUALITY SCORE PRESERVED: PASS")
        print("EVALUATION METADATA STORED IN FEEDBACK: PASS")

        # 2. Context-only evaluation must not invent reference quality.
        context_quality, context_memory, context_feedback = (
            adapter.record_result(
                request,
                result,
                quality=quality,
                context="ModelNow automatically routes requests to suitable models.",
            )
        )

        context_metadata = context_memory.metadata
        context_evaluation = context_metadata["reference_evaluation"]

        assert context_metadata["reference_evaluation_status"] == "completed"
        assert context_evaluation["quality_score"] is None
        assert "lexical_context_overlap" in context_evaluation["metrics"]
        assert "exact_match" not in context_evaluation["metrics"]
        assert context_quality.score == original_quality_score
        assert context_feedback.quality_score == original_quality_score
        print("CONTEXT-ONLY EVALUATION: PASS")
        print("NO FABRICATED REFERENCE QUALITY SCORE: PASS")

        # 3. Supplemental evaluator failure must not stop persistence.
        adapter.evaluation_engine = FailingEvaluationEngine()

        failed_quality, failed_memory, failed_feedback = (
            adapter.record_result(
                request,
                result,
                quality=quality,
                reference="A reference answer for the failure test.",
            )
        )

        failed_metadata = failed_memory.metadata

        assert failed_metadata["reference_evaluation_status"] == "failed"
        assert (
            failed_metadata["reference_evaluation_error"]
            == "RuntimeError"
        )
        assert failed_quality.score == original_quality_score
        assert failed_feedback.quality_score == original_quality_score
        assert adapter.model_memory.count() == 3
        assert adapter.feedback_store.count() == 3
        assert (
            failed_feedback.metadata["reference_evaluation_status"]
            == "failed"
        )
        print("EVALUATION FAILURE ISOLATION: PASS")
        print("MEMORY AND FEEDBACK PERSIST AFTER FAILURE: PASS")

        # 4. No reference/context must preserve the existing behavior.
        adapter.evaluation_engine = __import__(
            "ai.evaluation",
            fromlist=["EvaluationEngine"],
        ).EvaluationEngine()

        plain_quality, plain_memory, plain_feedback = adapter.record_result(
            request,
            result,
            quality=quality,
        )

        plain_metadata = plain_memory.metadata

        assert "reference_evaluation" not in plain_metadata
        assert "reference_evaluation_status" not in plain_metadata
        assert plain_quality.score == original_quality_score
        assert plain_feedback.quality_score == original_quality_score
        assert adapter.model_memory.count() == 4
        assert adapter.feedback_store.count() == 4
        print("NO-REFERENCE REGRESSION: PASS")
        print("ALL SUPPLEMENTAL EVALUATION INTEGRATION TESTS PASSED")

    finally:
        await inference_engine.close()


if __name__ == "__main__":
    asyncio.run(main())


