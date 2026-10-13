from __future__ import annotations

from typing import Any

from ai.prompt_management.exceptions import PromptValidationError


def validate_request(request: Any) -> None:
    """Validate the minimum contract required for prompt execution."""
    if not isinstance(getattr(request, "tenant_id", None), str):
        raise PromptValidationError("Execution tenant_id must be a string.")
    if not request.tenant_id.strip():
        raise PromptValidationError("Execution tenant_id is required.")
    if not isinstance(getattr(request, "prompt", None), str):
        raise PromptValidationError("Execution prompt must be a string.")
    if not request.prompt.strip():
        raise PromptValidationError("Execution prompt cannot be empty.")
    if not isinstance(getattr(request, "metadata", None), dict):
        raise PromptValidationError("Execution metadata must be a dictionary.")


def normalize_result(result: Any) -> tuple[str, dict[str, Any]]:
    """Normalize common handler return values to output and metadata."""
    if isinstance(result, str):
        if not result.strip():
            raise PromptValidationError("Model handler returned empty output.")
        return result, {}

    if isinstance(result, dict):
        output = result.get("output")
        if not isinstance(output, str) or not output.strip():
            raise PromptValidationError(
                "Handler result must contain non-empty string 'output'."
            )
        metadata = result.get("metadata", {})
        if not isinstance(metadata, dict):
            raise PromptValidationError("Result metadata must be a dictionary.")

        normalized_metadata = dict(metadata)
        if isinstance(result.get("model"), str):
            normalized_metadata.setdefault("model", result["model"])
        return output, normalized_metadata

    raise PromptValidationError(
        "Handler must return a string or a result dictionary."
    )
