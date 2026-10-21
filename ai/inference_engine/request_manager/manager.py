from __future__ import annotations

from typing import Any

from ai.inference_engine.models import InferenceRequest

from .parser import RequestParser
from .validator import RequestValidator


class RequestManager:
    """Parse and validate inference requests."""

    def __init__(
        self,
        parser: RequestParser | None = None,
        validator: RequestValidator | None = None,
    ) -> None:
        self.parser = (
            parser
            or RequestParser()
        )

        self.validator = (
            validator
            or RequestValidator()
        )

    def parse(
        self,
        data: dict[str, Any],
    ) -> InferenceRequest:
        request = self.parser.parse(data)

        self.validator.validate(request)

        return request

    def validate(
        self,
        request: InferenceRequest,
    ) -> InferenceRequest:
        self.validator.validate(request)

        return request


__all__ = ["RequestManager"]
