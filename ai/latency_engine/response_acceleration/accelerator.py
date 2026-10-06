from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping

from .optimizer import (
    AccelerationPlan,
    ResponseOptimizer,
)
from .predictor import (
    ResponsePrediction,
    ResponsePredictor,
)
from .utils import response_size_bytes


@dataclass(frozen=True)
class AccelerationResult:
    response: Any
    prediction: ResponsePrediction
    plan: AccelerationPlan
    original_size_bytes: int
    accelerated: bool = False
    metadata: Mapping[str, Any] = field(
        default_factory=dict
    )


class ResponseAccelerator:
    def __init__(
        self,
        *,
        predictor: ResponsePredictor | None = None,
        optimizer: ResponseOptimizer | None = None,
    ) -> None:
        self.predictor = (
            predictor or ResponsePredictor()
        )
        self.optimizer = (
            optimizer or ResponseOptimizer()
        )

    def accelerate(
        self,
        response: Any,
        *,
        model_id: str,
        provider: str,
        latency_ms: float | None = None,
        streaming_requested: bool = False,
        metadata: Mapping[str, Any] | None = None,
    ) -> AccelerationResult:
        prediction = self.predictor.predict(
            model_id,
            provider,
            response,
            latency_ms=latency_ms,
        )

        plan = self.optimizer.optimize(
            response,
            predicted_latency_ms=(
                prediction.predicted_latency_ms
            ),
            streaming_requested=streaming_requested,
            metadata=metadata,
        )

        return AccelerationResult(
            response=response,
            prediction=prediction,
            plan=plan,
            original_size_bytes=response_size_bytes(
                response
            ),
            accelerated=False,
            metadata={
                "model_id": model_id,
                "provider": provider,
                "strategy": plan.strategy.value,
                "delivery_adapter_required": (
                    plan.strategy.value != "none"
                ),
            },
        )

    def record_latency(
        self,
        model_id: str,
        provider: str,
        latency_ms: float,
    ) -> None:
        self.predictor.record(
            model_id,
            provider,
            latency_ms,
        )

    def reset(self) -> None:
        self.predictor.clear()
        self.optimizer.reset()


__all__ = [
    "AccelerationResult",
    "ResponseAccelerator",
]
