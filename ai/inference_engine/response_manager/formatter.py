from __future__ import annotations

from typing import Any

from ai.inference_engine.models import InferenceResult


class ResponseFormatter:
    """Format inference results for downstream consumers."""

    def format(
        self,
        result: InferenceResult,
    ) -> dict[str, Any]:
        return {
            "request_id": result.request_id,
            "model": result.model,
            "backend": result.backend.value,
            "content": result.content,
            "status": result.status.value,
            "usage": {
                "input_tokens": result.usage.input_tokens,
                "output_tokens": result.usage.output_tokens,
                "total_tokens": result.usage.total_tokens,
                "estimated_cost": result.usage.estimated_cost,
            },
            "latency_ms": result.latency_ms,
            "time_to_first_token_ms": (
                result.time_to_first_token_ms
            ),
            "finish_reason": result.finish_reason,
            "tool_calls": list(result.tool_calls),
            "metadata": dict(result.metadata),
        }
