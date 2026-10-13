from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping

from .utils import (
    DEFAULT_TARGET_TTFT_MS,
    estimate_tokens,
    validate_latency_ms,
)


@dataclass(frozen=True)
class ResponsePrediction:
    model_id: str
    provider: str
    predicted_latency_ms: float
    confidence: float
    estimated_tokens: int = 0
    should_accelerate: bool = False
    metadata: Mapping[str, Any] = field(
        default_factory=dict
    )


class ResponsePredictor:
    def __init__(
        self,
        *,
        target_latency_ms: float = DEFAULT_TARGET_TTFT_MS,
    ) -> None:
        self._target_latency_ms = validate_latency_ms(
            target_latency_ms
        )
        self._history: dict[
            tuple[str, str],
            list[float],
        ] = {}

    @property
    def target_latency_ms(self) -> float:
        return self._target_latency_ms

    def record(
        self,
        model_id: str,
        provider: str,
        latency_ms: float,
    ) -> None:
        if not model_id:
            raise ValueError(
                "model_id must not be empty"
            )

        if not provider:
            raise ValueError(
                "provider must not be empty"
            )

        latency_ms = validate_latency_ms(
            latency_ms
        )

        key = (model_id, provider)

        self._history.setdefault(
            key,
            [],
        ).append(latency_ms)

    def predict(
        self,
        model_id: str,
        provider: str,
        response: Any = None,
        *,
        latency_ms: float | None = None,
    ) -> ResponsePrediction:
        if not model_id:
            raise ValueError(
                "model_id must not be empty"
            )

        if not provider:
            raise ValueError(
                "provider must not be empty"
            )

        key = (model_id, provider)
        history = self._history.get(
            key,
            [],
        )

        if latency_ms is not None:
            predicted_latency = validate_latency_ms(
                latency_ms
            )
        elif history:
            predicted_latency = sum(history) / len(
                history
            )
        else:
            predicted_latency = self._target_latency_ms

        sample_count = len(history)

        confidence = min(
            1.0,
            sample_count / 10.0,
        )

        if sample_count == 0:
            confidence = 0.25

        estimated_tokens = estimate_tokens(
            response
        )

        accelerate = (
            predicted_latency
            > self._target_latency_ms
        )

        return ResponsePrediction(
            model_id=model_id,
            provider=provider,
            predicted_latency_ms=predicted_latency,
            confidence=confidence,
            estimated_tokens=estimated_tokens,
            should_accelerate=accelerate,
            metadata={
                "samples": sample_count,
                "target_latency_ms": (
                    self._target_latency_ms
                ),
            },
        )

    def history(
        self,
        model_id: str,
        provider: str,
    ) -> tuple[float, ...]:
        return tuple(
            self._history.get(
                (model_id, provider),
                [],
            )
        )

    def clear(self) -> None:
        self._history.clear()


__all__ = [
    "ResponsePrediction",
    "ResponsePredictor",
]
