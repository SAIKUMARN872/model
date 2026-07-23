"""
Chat validators.

Validates chat requests, messages, AI model parameters,
and conversation inputs.
"""

from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status



def validate_message(
    message: str,
) -> bool:
    """
    Validate chat message content.
    """

    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty.",
        )


    if not message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot contain only spaces.",
        )


    if len(message) > 10000:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Message length exceeds "
                "maximum limit of 10000 characters."
            ),
        )


    return True



def validate_model_name(
    model: str,
) -> bool:
    """
    Validate AI model name.
    """

    if not model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Model name is required.",
        )


    if len(model) > 100:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid model name.",
        )


    return True



def validate_temperature(
    temperature: float,
) -> bool:
    """
    Validate LLM temperature.

    Range:
    0.0 - 2.0
    """

    if temperature < 0 or temperature > 2:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Temperature must be "
                "between 0 and 2."
            ),
        )


    return True



def validate_max_tokens(
    max_tokens: int,
) -> bool:
    """
    Validate token limit.
    """

    if max_tokens <= 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Max tokens must be "
                "greater than zero."
            ),
        )


    if max_tokens > 100000:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Max tokens exceed "
                "allowed limit."
            ),
        )


    return True



def validate_conversation_id(
    conversation_id: str | None,
) -> bool:
    """
    Validate conversation identifier.
    """

    if conversation_id is None:
        return True


    if len(conversation_id) < 10:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid conversation ID.",
        )


    return True



def validate_chat_request(
    data: dict[str, Any],
) -> bool:
    """
    Validate complete chat request payload.
    """

    validate_message(
        data.get("message"),
    )


    if data.get("model"):

        validate_model_name(
            data["model"],
        )


    if data.get("temperature") is not None:

        validate_temperature(
            data["temperature"],
        )


    if data.get("max_tokens"):

        validate_max_tokens(
            data["max_tokens"],
        )


    validate_conversation_id(
        data.get("conversation_id"),
    )


    return True