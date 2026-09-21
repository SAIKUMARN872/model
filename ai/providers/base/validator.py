@'
from __future__ import annotations

from typing import Any

from .models import ModelInfo
from .request import ChatRequest
from .schemas import ValidationResult


class RequestValidator:
    """
    Provider-agnostic validation layer for ModelNow chat requests.

    This validates normalized requests before they reach a
    concrete provider adapter.
    """

    def validate(
        self,
        request: ChatRequest,
    ) -> ValidationResult:
        result = ValidationResult()

        self._validate_model(
            request,
            result,
        )

        self._validate_messages(
            request,
            result,
        )

        self._validate_sampling(
            request,
            result,
        )

        self._validate_output(
            request,
            result,
        )

        self._validate_tools(
            request,
            result,
        )

        return result

    def validate_or_raise(
        self,
        request: ChatRequest,
    ) -> ChatRequest:
        """
        Validate a request and raise ValueError when invalid.

        Returns the original request when validation succeeds.
        """

        result = self.validate(request)

        if not result.is_valid:
            messages = "; ".join(
                str(issue)
                for issue in result.issues
            )

            raise ValueError(
                messages
                or "Chat request validation failed."
            )

        return request

    def validate_model(
        self,
        request: ChatRequest,
        model: ModelInfo,
    ) -> ValidationResult:
        """
        Validate a request against a specific model's
        capabilities and limits.
        """

        result = self.validate(request)

        if not model.enabled:
            result.add_error(
                field="model",
                message=(
                    f"Model '{model.id}' is disabled."
                ),
                code="model_disabled",
            )

        if (
            request.max_tokens is not None
            and model.max_output_tokens is not None
            and request.max_tokens
            > model.max_output_tokens
        ):
            result.add_error(
                field="max_tokens",
                message=(
                    f"max_tokens exceeds model limit "
                    f"of {model.max_output_tokens}."
                ),
                code="max_tokens_exceeded",
            )

        if request.stream and not model.supports("streaming"):
            result.add_error(
                field="stream",
                message=(
                    f"Model '{model.id}' does not "
                    "support streaming."
                ),
                code="streaming_unsupported",
            )

        if request.tools and not model.supports("tool_use"):
            result.add_error(
                field="tools",
                message=(
                    f"Model '{model.id}' does not "
                    "support tool use."
                ),
                code="tool_use_unsupported",
            )

        return result

    def _validate_model(
        self,
        request: ChatRequest,
        result: ValidationResult,
    ) -> None:
        model = request.model

        if not isinstance(model, str):
            result.add_error(
                field="model",
                message="model must be a string.",
                code="invalid_model",
            )
            return

        if not model.strip():
            result.add_error(
                field="model",
                message="model is required.",
                code="missing_model",
            )

    def _validate_messages(
        self,
        request: ChatRequest,
        result: ValidationResult,
    ) -> None:
        if not request.messages:
            result.add_error(
                field="messages",
                message=(
                    "At least one message is required."
                ),
                code="missing_messages",
            )
            return

        for index, message in enumerate(
            request.messages
        ):
            field = f"messages[{index}]"

            if not message.role.strip():
                result.add_error(
                    field=f"{field}.role",
                    message="message role is required.",
                    code="invalid_message_role",
                )

            valid_roles = {
                "system",
                "user",
                "assistant",
                "tool",
                "developer",
            }

            if message.role not in valid_roles:
                result.add_error(
                    field=f"{field}.role",
                    message=(
                        f"Unsupported message role "
                        f"'{message.role}'."
                    ),
                    code="invalid_message_role",
                )

            if message.content is None:
                result.add_error(
                    field=f"{field}.content",
                    message=(
                        "message content cannot be None."
                    ),
                    code="invalid_message_content",
                )

    def _validate_sampling(
        self,
        request: ChatRequest,
        result: ValidationResult,
    ) -> None:
        if request.temperature is not None:
            if not 0.0 <= request.temperature <= 2.0:
                result.add_error(
                    field="temperature",
                    message=(
                        "temperature must be between "
                        "0 and 2."
                    ),
                    code="invalid_temperature",
                )

        if request.top_p is not None:
            if not 0.0 < request.top_p <= 1.0:
                result.add_error(
                    field="top_p",
                    message=(
                        "top_p must be greater than 0 "
                        "and at most 1."
                    ),
                    code="invalid_top_p",
                )

    def _validate_output(
        self,
        request: ChatRequest,
        result: ValidationResult,
    ) -> None:
        if request.max_tokens is not None:
            if request.max_tokens <= 0:
                result.add_error(
                    field="max_tokens",
                    message=(
                        "max_tokens must be greater "
                        "than zero."
                    ),
                    code="invalid_max_tokens",
                )

        if request.seed is not None:
            if not isinstance(request.seed, int):
                result.add_error(
                    field="seed",
                    message="seed must be an integer.",
                    code="invalid_seed",
                )

        if request.stop:
            for index, value in enumerate(
                request.stop
            ):
                if not isinstance(value, str):
                    result.add_error(
                        field=f"stop[{index}]",
                        message=(
                            "stop values must be strings."
                        ),
                        code="invalid_stop",
                    )

    def _validate_tools(
        self,
        request: ChatRequest,
        result: ValidationResult,
    ) -> None:
        if not request.tools:
            return

        names: set[str] = set()

        for index, tool in enumerate(
            request.tools
        ):
            field = f"tools[{index}]"

            if not tool.name.strip():
                result.add_error(
                    field=f"{field}.name",
                    message="tool name is required.",
                    code="invalid_tool_name",
                )

            if tool.name in names:
                result.add_error(
                    field=f"{field}.name",
                    message=(
                        f"Duplicate tool name "
                        f"'{tool.name}'."
                    ),
                    code="duplicate_tool_name",
                )

            names.add(tool.name)

            if not isinstance(
                tool.parameters,
                dict,
            ):
                result.add_error(
                    field=f"{field}.parameters",
                    message=(
                        "tool parameters must be a "
                        "dictionary."
                    ),
                    code="invalid_tool_parameters",
                )


__all__ = [
    "RequestValidator",
]
'@ | Set-Content ".\ai\providers\base\validator.py" -Encoding UTF8