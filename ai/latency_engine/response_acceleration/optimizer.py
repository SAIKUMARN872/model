from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Mapping

from .utils import (
    DEFAULT_MAX_BUFFER_SIZE,
    DEFAULT_TARGET_TTFT_MS,
    estimate_tokens,
    response_size_bytes,
    validate_buffer_size,
    validate_latency_ms,
)


class AccelerationStrategy(str, Enum):
    NONE = "none"
    STREAMING = "streaming"
    BUFFERED_STREAMING = "buffered_streaming"
    RESPONSE_COMPRESSION = "response_compression"


@dataclass(frozen=True)
class AccelerationPlan:
    strategy: AccelerationStrategy
    estimated_latency_ms: float
    response_size_bytes: int
    estimated_tokens: int
    reasons: tuple[str, ...] = ()
    metadata: Mapping[str, Any] = field(
        default_factory=dict
    )


class ResponseOptimizer:
    def __init__(
        self,
        *,
        target_latency_ms: float = DEFAULT_TARGET_TTFT_MS,
        max_buffer_size: int = DEFAULT_MAX_BUFFER_SIZE,
        streaming_enabled: bool = True,
        compression_enabled: bool = False,
    ) -> None:
        self._target_latency_ms = validate_latency_ms(
            target_latency_ms
        )
        self._max_buffer_size = validate_buffer_size(
            max_buffer_size
        )
        self._streaming_enabled = streaming_enabled
        self._compression_enabled = compression_enabled

    def optimize(
        self,
        response: Any,
        *,
        predicted_latency_ms: float,
        streaming_requested: bool = False,
        metadata: Mapping[str, Any] | None = None,
    ) -> AccelerationPlan:
        latency = validate_latency_ms(
            predicted_latency_ms
        )
        size_bytes = response_size_bytes(response)
        tokens = estimate_tokens(response)
        reasons: list[str] = []

        strategy = AccelerationStrategy.NONE

        if latency > self._target_latency_ms:
            reasons.append(
                "Predicted latency exceeds the target"
            )

            if (
                self._streaming_enabled
                and streaming_requested
            ):
                strategy = AccelerationStrategy.STREAMING
                reasons.append(
                    "Streaming can deliver initial content earlier"
                )
            elif (
                self._streaming_enabled
                and size_bytes > self._max_buffer_size
            ):
                strategy = AccelerationStrategy.STREAMING
                reasons.append(
                    "Large responses should avoid full-response buffering"
                )
            elif self._compression_enabled and size_bytes > 0:
                strategy = AccelerationStrategy.RESPONSE_COMPRESSION
                reasons.append(
                    "Compression is enabled for this response"
                )
            else:
                reasons.append(
                    "No enabled strategy can safely reduce this response's latency"
                )

        elif (
            streaming_requested
            and self._streaming_enabled
        ):
            strategy = AccelerationStrategy.STREAMING
            reasons.append(
                "Streaming was requested"
            )

        elif (
            size_bytes > self._max_buffer_size
            and self._streaming_enabled
        ):
            strategy = AccelerationStrategy.STREAMING
            reasons.append(
                "Response exceeds the configured buffer threshold"
            )

        return AccelerationPlan(
            strategy=strategy,
            estimated_latency_ms=latency,
            response_size_bytes=size_bytes,
            estimated_tokens=tokens,
            reasons=tuple(reasons),
            metadata=dict(metadata or {}),
        )

    def reset(self) -> None:
        return None


__all__ = [
    "AccelerationPlan",
    "AccelerationStrategy",
    "ResponseOptimizer",
]
