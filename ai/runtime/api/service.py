from __future__ import annotations

from collections.abc import AsyncIterator

from ai.routing_engine.constants import (
    DEFAULT_OBJECTIVE,
    RoutingObjective,
)
from ai.routing_engine.models import RoutingRequest
from ai.routing_engine.inference_adapter import RoutingInferenceAdapter
from ai.inference_engine.models import InferenceResult

from .schemas import ChatRequest


class RuntimeService:
    """Application service over the canonical ModelNow runtime."""

    def __init__(self, adapter: RoutingInferenceAdapter) -> None:
        self.adapter = adapter

    @staticmethod
    def _objective(value: str | None) -> RoutingObjective:
        if not value:
            return DEFAULT_OBJECTIVE

        normalized = value.strip().lower()

        for objective in RoutingObjective:
            if normalized == objective.value.lower():
                return objective

        raise ValueError(
            f"Unsupported routing objective: {value}"
        )

    @staticmethod
    def _routing_request(request: ChatRequest) -> RoutingRequest:
        metadata = dict(request.metadata)

        if request.request_id is not None:
            metadata["request_id"] = request.request_id

        if request.task_type is not None:
            metadata["task_type"] = request.task_type

        return RoutingRequest(
            model=request.model,
            messages=[
                message.model_dump()
                for message in request.messages
            ],
            objective=RuntimeService._objective(
                request.objective
            ),
            max_cost=request.max_cost,
            max_latency_ms=request.max_latency_ms,
            min_quality=request.min_quality,
            required_capabilities=tuple(
                request.required_capabilities
            ),
            preferred_tier=request.preferred_tier,
            stream=request.stream,
            metadata=metadata,
        )

    async def chat(
        self,
        request: ChatRequest,
    ) -> InferenceResult:
        routing_request = self._routing_request(request)

        return await self.adapter.infer(
            routing_request
        )

    async def chat_and_record(
        self,
        request: ChatRequest,
    ):
        routing_request = self._routing_request(request)

        return await self.adapter.infer_and_record(
            routing_request,
            reference=request.reference,
            required_terms=tuple(request.required_terms),
            relevance=request.relevance,
            correctness=request.correctness,
            completeness=request.completeness,
            coherence=request.coherence,
            target_latency_ms=request.target_latency_ms,
            target_cost=request.target_cost,
        )

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[InferenceResult]:
        routing_request = self._routing_request(request)

        async for result in self.adapter.stream(
            routing_request
        ):
            yield result


__all__ = ["RuntimeService"]
