"""
Utility functions for the ModelNow generator package.
"""

from __future__ import annotations

import json
import re
from typing import Any, Iterable


def validate_prompt(prompt: Any) -> str:
    """Validate a single generation prompt."""

    if not isinstance(prompt, str):
        raise TypeError(
            "Prompt must be a string"
        )

    prompt = prompt.strip()

    if not prompt:
        raise ValueError(
            "Prompt cannot be empty"
        )

    return prompt


def validate_prompts(
    prompts: Iterable[Any],
) -> list[str]:
    """Validate multiple prompts."""

    result = [
        validate_prompt(prompt)
        for prompt in prompts
    ]

    if not result:
        raise ValueError(
            "At least one prompt is required"
        )

    return result


def normalize_text(
    text: str,
) -> str:
    """Normalize generated text."""

    if text is None:
        return ""

    text = str(text)

    # Normalize line endings.
    text = text.replace(
        "\r\n",
        "\n",
    ).replace(
        "\r",
        "\n",
    )

    # Remove trailing whitespace while
    # preserving meaningful formatting.
    lines = [
        line.rstrip()
        for line in text.split("\n")
    ]

    return "\n".join(lines).strip()


def estimate_tokens(
    text: str,
) -> int:
    """
    Lightweight token estimation.

    This is not a tokenizer-level count.
    """

    if not text:
        return 0

    return max(
        1,
        len(
            re.findall(
                r"\S+",
                text,
            )
        ),
    )


def estimate_tokens_batch(
    texts: Iterable[str],
) -> int:
    return sum(
        estimate_tokens(text)
        for text in texts
    )


def truncate_text(
    text: str,
    max_characters: int,
) -> str:
    """Safely truncate text."""

    if max_characters <= 0:
        raise ValueError(
            "max_characters must be positive"
        )

    if len(text) <= max_characters:
        return text

    return text[
        :max_characters
    ].rstrip()


def merge_generation_kwargs(
    defaults: dict[str, Any] | None,
    overrides: dict[str, Any] | None,
) -> dict[str, Any]:
    """
    Merge generation settings.

    Overrides always take precedence.
    """

    result = dict(
        defaults or {}
    )

    result.update(
        overrides or {}
    )

    return result


def safe_json(
    value: Any,
) -> str:
    """Convert a value to JSON."""

    try:
        return json.dumps(
            value,
            ensure_ascii=False,
            default=str,
        )
    except Exception:
        return str(value)


def extract_text(
    response: Any,
) -> str:
    """
    Extract generated text from common response shapes.

    Supports:
        str
        {"text": "..."}
        {"generated_text": "..."}
        objects with .text
        objects with .generated_text
    """

    if isinstance(
        response,
        str,
    ):
        return response

    if isinstance(
        response,
        dict,
    ):

        for key in (
            "text",
            "generated_text",
            "content",
            "output",
            "response",
        ):

            if key in response:

                value = response[key]

                if value is not None:
                    return str(value)

    for attribute in (
        "text",
        "generated_text",
        "content",
        "output",
        "response",
    ):

        if hasattr(
            response,
            attribute,
        ):

            value = getattr(
                response,
                attribute,
            )

            if value is not None:
                return str(value)

    return str(response)


def batch_items(
    items: list[Any],
    batch_size: int,
) -> list[list[Any]]:
    """Split items into batches."""

    if batch_size <= 0:
        raise ValueError(
            "batch_size must be positive"
        )

    return [
        items[index:index + batch_size]
        for index in range(
            0,
            len(items),
            batch_size,
        )
    ]


def remove_prompt_prefix(
    prompt: str,
    generated: str,
) -> str:
    """
    Remove the original prompt when a model returns
    prompt + generated text.
    """

    if generated.startswith(
        prompt
    ):

        return generated[
            len(prompt):
        ].lstrip()

    return generated