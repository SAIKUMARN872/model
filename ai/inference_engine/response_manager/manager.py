from __future__ import annotations

from typing import Any

from ai.inference_engine.models import InferenceResult

from .formatter import ResponseFormatter
from .serializer import ResponseSerializer


class ResponseManager:
    """Format and serialize inference results."""

    def __init__(
        self,
        formatter: ResponseFormatter | None = None,
        serializer: ResponseSerializer | None = None,
    ) -> None:
        self.formatter = (
            formatter
            or ResponseFormatter()
        )
        self.serializer = (
            serializer
            or ResponseSerializer()
        )

    def format(
        self,
        result: InferenceResult,
    ) -> dict[str, Any]:
        return self.formatter.format(result)

    def to_dict(
        self,
        result: InferenceResult,
    ) -> dict[str, Any]:
        formatted = self.format(result)
        return self.serializer.to_dict(
            formatted
        )

    def to_json(
        self,
        result: InferenceResult,
    ) -> str:
        formatted = self.format(result)
        return self.serializer.to_json(
            formatted
        )
