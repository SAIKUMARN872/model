from __future__ import annotations

from ai.inference_engine.models import InferenceRequest


class RequestValidator:
    """Validate inference requests before execution."""

    def validate(
        self,
        request: InferenceRequest,
    ) -> None:
        if not request.model.strip():
            raise ValueError(
                "Inference request model cannot be empty."
            )

        if not request.messages:
            raise ValueError(
                "Inference request must contain at least one message."
            )

        for index, message in enumerate(
            request.messages
        ):
            if not isinstance(message, dict):
                raise TypeError(
                    f"Message at index {index} must be a dictionary."
                )

            role = message.get("role")
            content = message.get("content")

            if not role:
                raise ValueError(
                    f"Message at index {index} is missing role."
                )

            if content is None:
                raise ValueError(
                    f"Message at index {index} is missing content."
                )

        if (
            request.temperature is not None
            and not 0 <= request.temperature <= 2
        ):
            raise ValueError(
                "temperature must be between 0 and 2."
            )

        if (
            request.top_p is not None
            and not 0 <= request.top_p <= 1
        ):
            raise ValueError(
                "top_p must be between 0 and 1."
            )

        if (
            request.max_tokens is not None
            and request.max_tokens < 1
        ):
            raise ValueError(
                "max_tokens must be at least 1."
            )


__all__ = ["RequestValidator"]
