from __future__ import annotations

from collections.abc import AsyncIterator

from ai.inference_engine.engine import InferenceEngine
from ai.inference_engine.models import InferenceRequest, InferenceResult

from .engine import RoutingEngine
from .learning_router.feedback import FeedbackStore, RoutingFeedback
from .model_memory.memory import MemoryRecord, ModelMemory
from .quality_evaluator.evaluator import (
    EvaluationInput,
    QualityEvaluator,
)
from .quality_evaluator.scorer import QualityScore
from .models import RoutingDecision, RoutingRequest


class RoutingInferenceAdapter:
    """Bridge ModelNow routing to inference and post-inference intelligence."""

    def __init__(
        self,
        routing_engine: RoutingEngine | None = None,
        inference_engine: InferenceEngine | None = None,
        quality_evaluator: QualityEvaluator | None = None,
        model_memory: ModelMemory | None = None,
        feedback_store: FeedbackStore | None = None,
    ) -> None:
        self.routing_engine = (
            routing_engine
            if routing_engine is not None
            else RoutingEngine()
        )

        self.inference_engine = (
            inference_engine
            if inference_engine is not None
            else InferenceEngine()
        )

        self.quality_evaluator = (
            quality_evaluator
            if quality_evaluator is not None
            else QualityEvaluator()
        )

        self.model_memory = (
            model_memory
            if model_memory is not None
            else ModelMemory()
        )

        self.feedback_store = (
            feedback_store
            if feedback_store is not None
            else FeedbackStore()
        )

    async def route(
        self,
        request: RoutingRequest,
    ) -> RoutingDecision:
        """Select a model using the existing RoutingEngine."""
        return await self.routing_engine.route(request)

    @staticmethod
    def to_inference_request(
        request: RoutingRequest,
        decision: RoutingDecision,
    ) -> InferenceRequest:
        """Convert a routing decision into an inference request."""
        if not decision.model_id:
            raise ValueError(
                "Routing decision does not contain a model_id."
            )

        metadata = dict(request.metadata)

        metadata.update(
            {
                "routing_status": decision.status.value,
                "routing_provider": decision.provider,
                "routing_tier": decision.tier,
                "routing_score": decision.score,
                "routing_reason": decision.reason,
                "routing_candidates_considered": (
                    decision.candidates_considered
                ),
            }
        )

        request_id = metadata.get("request_id")

        if request_id is not None:
            request_id = str(request_id).strip()

            if not request_id:
                request_id = None

        return InferenceRequest(
            model=decision.model_id,
            messages=list(request.messages),
            stream=request.stream,
            request_id=request_id,
            metadata=metadata,
        )

    @staticmethod
    def _request_id(
        request: RoutingRequest,
        result: InferenceResult,
    ) -> str:
        request_id = (
            result.request_id
            or request.metadata.get("request_id")
        )

        if request_id is None:
            raise ValueError(
                "A request_id is required to record inference feedback."
            )

        value = str(request_id).strip()

        if not value:
            raise ValueError(
                "request_id cannot be empty."
            )

        return value

    @staticmethod
    def _task_type(
        request: RoutingRequest,
        result: InferenceResult,
    ) -> str:
        task_type = result.metadata.get("task_type")

        if task_type is None:
            task_type = request.metadata.get("task_type")

        if task_type is None:
            return "general"

        value = str(task_type).strip().lower()

        return value or "general"

    @staticmethod
    def _provider(
        result: InferenceResult,
    ) -> str:
        provider = result.metadata.get("routing_provider")

        if provider is None:
            provider = result.metadata.get("provider")

        if provider is None:
            provider = result.metadata.get("inference_provider")

        if provider is None:
            provider = result.backend.value

        value = str(provider).strip()

        return value or result.backend.value

    @staticmethod
    def _tier(
        request: RoutingRequest,
        result: InferenceResult,
    ) -> str:
        tier = result.metadata.get("routing_tier")

        if tier is None:
            tier = request.preferred_tier

        if tier is None:
            tier = result.metadata.get("tier")

        value = str(tier).strip().lower() if tier is not None else ""

        return value or "unknown"

    def evaluate_result(
        self,
        request: RoutingRequest,
        result: InferenceResult,
        *,
        reference: str | None = None,
        required_terms: tuple[str, ...] = (),
        relevance: float | None = None,
        correctness: float | None = None,
        completeness: float | None = None,
        coherence: float | None = None,
        target_latency_ms: float | None = None,
        target_cost: float | None = None,
    ) -> QualityScore:
        """Evaluate a completed inference result."""
        if not isinstance(request, RoutingRequest):
            raise TypeError(
                "request must be a RoutingRequest instance"
            )

        if not isinstance(result, InferenceResult):
            raise TypeError(
                "result must be an InferenceResult instance"
            )

        evaluation = EvaluationInput(
            response=result.content,
            reference=reference,
            required_terms=required_terms,
            relevance=relevance,
            correctness=correctness,
            completeness=completeness,
            coherence=coherence,
            latency_ms=result.latency_ms,
            target_latency_ms=target_latency_ms,
            cost=result.usage.estimated_cost,
            target_cost=target_cost,
        )

        return self.quality_evaluator.evaluate(
            evaluation
        )

    def record_result(
        self,
        request: RoutingRequest,
        result: InferenceResult,
        quality: QualityScore | None = None,
        *,
        reference: str | None = None,
        required_terms: tuple[str, ...] = (),
        relevance: float | None = None,
        correctness: float | None = None,
        completeness: float | None = None,
        coherence: float | None = None,
        target_latency_ms: float | None = None,
        target_cost: float | None = None,
    ) -> tuple[QualityScore, MemoryRecord, RoutingFeedback]:
        """Evaluate and persist a completed inference observation."""
        if not isinstance(request, RoutingRequest):
            raise TypeError(
                "request must be a RoutingRequest instance"
            )

        if not isinstance(result, InferenceResult):
            raise TypeError(
                "result must be an InferenceResult instance"
            )

        if quality is None:
            quality = self.evaluate_result(
                request,
                result,
                reference=reference,
                required_terms=required_terms,
                relevance=relevance,
                correctness=correctness,
                completeness=completeness,
                coherence=coherence,
                target_latency_ms=target_latency_ms,
                target_cost=target_cost,
            )

        request_id = self._request_id(
            request,
            result,
        )

        latency_ms = (
            result.latency_ms
            if result.latency_ms is not None
            else 0.0
        )

        cost = float(
            result.usage.estimated_cost
        )

        success = result.status.value == "completed"

        provider = self._provider(result)
        tier = self._tier(request, result)
        task_type = self._task_type(request, result)

        metadata = dict(result.metadata)

        metadata.update(
            {
                "quality_grade": quality.grade,
                "quality_passed": quality.passed,
                "quality_metrics": quality.metrics,
                "inference_status": result.status.value,
                "backend": result.backend.value,
                "input_tokens": result.usage.input_tokens,
                "output_tokens": result.usage.output_tokens,
                "total_tokens": result.usage.total_tokens,
            }
        )

        memory_record = MemoryRecord(
            request_id=request_id,
            model_id=result.model,
            provider=provider,
            tier=tier,
            quality_score=quality.score,
            latency_ms=latency_ms,
            cost=cost,
            success=success,
            task_type=task_type,
            metadata=metadata,
        )

        feedback = RoutingFeedback(
            request_id=request_id,
            model_id=result.model,
            provider=provider,
            tier=tier,
            task_type=task_type,
            quality_score=quality.score,
            latency_ms=latency_ms,
            cost=cost,
            success=success,
            reward=(
                quality.score
                if success
                else -quality.score
            ),
            metadata=metadata,
        )

        self.model_memory.add(
            memory_record
        )

        self.feedback_store.add(
            feedback
        )

        return quality, memory_record, feedback

    async def infer(
        self,
        request: RoutingRequest,
    ) -> InferenceResult:
        """Route the request, then execute it through InferenceEngine."""
        decision = await self.route(request)

        inference_request = self.to_inference_request(
            request,
            decision,
        )

        return await self.inference_engine.infer(
            inference_request
        )

    async def infer_and_record(
        self,
        request: RoutingRequest,
        *,
        reference: str | None = None,
        required_terms: tuple[str, ...] = (),
        relevance: float | None = None,
        correctness: float | None = None,
        completeness: float | None = None,
        coherence: float | None = None,
        target_latency_ms: float | None = None,
        target_cost: float | None = None,
    ) -> tuple[
        InferenceResult,
        QualityScore,
        MemoryRecord,
        RoutingFeedback,
    ]:
        """Route, infer, evaluate, and persist the result."""
        result = await self.infer(request)

        quality, memory_record, feedback = self.record_result(
            request,
            result,
            reference=reference,
            required_terms=required_terms,
            relevance=relevance,
            correctness=correctness,
            completeness=completeness,
            coherence=coherence,
            target_latency_ms=target_latency_ms,
            target_cost=target_cost,
        )

        return (
            result,
            quality,
            memory_record,
            feedback,
        )

    async def stream(
        self,
        request: RoutingRequest,
    ) -> AsyncIterator[InferenceResult]:
        """Route the request, then stream through InferenceEngine."""
        decision = await self.route(request)

        inference_request = self.to_inference_request(
            request,
            decision,
        )

        async for result in self.inference_engine.stream(
            inference_request
        ):
            yield result


__all__ = [
    "RoutingInferenceAdapter",
]
