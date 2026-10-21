from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from ai.prompt_management.exceptions import PromptValidationError
from ai.prompt_management.executor.utils import normalize_result, validate_request


ModelHandler = Callable[[str, dict[str, Any]], Any]


@dataclass(frozen=True, slots=True)
class ExecutionRequest:
    prompt: str
    tenant_id: str
    metadata: dict[str, Any] = field(default_factory=dict)
    model_hint: str | None = None


@dataclass(frozen=True, slots=True)
class ExecutionResult:
    output: str
    tenant_id: str
    model: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


class PromptExecutor:
    """Execute a prepared prompt through an injected model handler."""

    def __init__(self, handler: ModelHandler) -> None:
        if not callable(handler):
            raise PromptValidationError("Execution handler must be callable.")
        self._handler = handler

    def execute(self, request: ExecutionRequest) -> ExecutionResult:
        validate_request(request)
        handler_context = dict(request.metadata)
        if request.model_hint is not None:
            handler_context["model_hint"] = request.model_hint

        raw_result = self._handler(request.prompt, handler_context)
        output, result_metadata = normalize_result(raw_result)

        model = result_metadata.get("model")
        return ExecutionResult(
            output=output,
            tenant_id=request.tenant_id,
            model=model if isinstance(model, str) else request.model_hint,
            metadata=result_metadata,
        )
