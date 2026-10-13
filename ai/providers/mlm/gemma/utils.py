from __future__ import annotations

from ...base.request import ChatRequest


def messages_to_dicts(request: ChatRequest) -> list[dict[str, str]]:
    return [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in request.messages
    ]


def validate_model(
    requested_model: str,
    supported_models: tuple[str, ...],
) -> None:
    normalized = requested_model.strip().lower()

    if not normalized:
        raise ValueError("Gemma model cannot be empty.")

    if normalized not in {
        model.lower()
        for model in supported_models
    }:
        raise ValueError(
            f"Gemma does not support model '{requested_model}'."
        )
