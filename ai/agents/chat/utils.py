"""
Utility functions for the chat system.
"""

from __future__ import annotations

import json
import re
from typing import Any, Iterable

from .conversation import ChatMessage


def normalize_message(
    content: Any,
) -> str:
    """
    Convert input into normalized text.
    """

    if content is None:
        return ""

    if isinstance(
        content,
        str,
    ):
        return content.strip()

    if isinstance(
        content,
        (dict, list, tuple),
    ):
        return json.dumps(
            content,
            default=str,
        )

    return str(content).strip()


def validate_message(
    content: Any,
) -> str:
    """
    Validate a chat message.
    """

    content = normalize_message(
        content
    )

    if not content:
        raise ValueError(
            "Message cannot be empty"
        )

    return content


def build_chat_history(
    messages: Iterable[ChatMessage],
) -> list[dict[str, str]]:
    """
    Convert ChatMessage objects into a
    model-friendly message format.
    """

    return [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in messages
    ]


def count_characters(
    messages: Iterable[ChatMessage],
) -> int:

    return sum(
        len(message.content)
        for message in messages
    )


def approximate_tokens(
    text: str,
) -> int:
    """
    Lightweight token approximation.

    This is intentionally not a tokenizer. The Cost Engine's
    token counter can be used when exact model-specific
    token counting is required.
    """

    text = normalize_message(
        text
    )

    if not text:
        return 0

    # Rough approximation:
    # approximately 4 characters/token.
    return max(
        1,
        (len(text) + 3) // 4,
    )


def conversation_token_estimate(
    messages: Iterable[ChatMessage],
) -> int:

    return sum(
        approximate_tokens(
            message.content
        )
        for message in messages
    )


def sanitize_metadata(
    metadata: dict[str, Any] | None,
) -> dict[str, Any]:

    if not metadata:
        return {}

    result: dict[str, Any] = {}

    for key, value in metadata.items():

        if not isinstance(
            key,
            str,
        ):
            key = str(key)

        try:
            json.dumps(
                value,
                default=str,
            )

            result[key] = value

        except (
            TypeError,
            ValueError,
        ):

            result[key] = str(value)

    return result


def truncate_history(
    messages: list[ChatMessage],
    max_messages: int,
) -> list[ChatMessage]:

    if max_messages <= 0:
        return []

    if len(messages) <= max_messages:
        return list(messages)

    return list(
        messages[-max_messages:]
    )


def clean_response(
    response: Any,
) -> str:

    if response is None:
        return ""

    if isinstance(
        response,
        str,
    ):
        return response.strip()

    if isinstance(
        response,
        dict,
    ):

        if "content" in response:
            return normalize_message(
                response["content"]
            )

        if "output" in response:
            return normalize_message(
                response["output"]
            )

    return normalize_message(
        response
    )


def contains_command(
    text: str,
    command: str,
) -> bool:

    if not text or not command:
        return False

    pattern = (
        r"(?<!\w)"
        + re.escape(command)
        + r"(?!\w)"
    )

    return bool(
        re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )
    )