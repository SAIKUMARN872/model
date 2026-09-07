"""
Common helper utilities.

Provides reusable helper functions used across
services, repositories, APIs, and background tasks.
"""

from __future__ import annotations

import re
import secrets
import string
from typing import Any, Iterable
from uuid import UUID, uuid4



def generate_id() -> UUID:
    """
    Generate unique UUID.
    """

    return uuid4()



def generate_random_string(
    length: int = 16,
) -> str:
    """
    Generate secure random string.
    """

    characters = (
        string.ascii_letters
        + string.digits
    )

    return "".join(
        secrets.choice(characters)
        for _ in range(length)
    )



def sanitize_string(
    value: str,
) -> str:
    """
    Remove unwanted spaces and characters.
    """

    return re.sub(
        r"\s+",
        " ",
        value.strip(),
    )



def slugify(
    value: str,
) -> str:
    """
    Convert text into URL-friendly slug.
    """

    value = value.lower()

    value = re.sub(
        r"[^a-z0-9]+",
        "-",
        value,
    )

    return value.strip("-")



def chunk_list(
    items: list[Any],
    size: int,
) -> list[list[Any]]:
    """
    Split list into chunks.
    """

    return [
        items[index:index + size]
        for index in range(
            0,
            len(items),
            size,
        )
    ]



def remove_none_values(
    data: dict[str, Any],
) -> dict[str, Any]:
    """
    Remove None values from dictionary.
    """

    return {
        key: value
        for key, value in data.items()
        if value is not None
    }



def flatten_list(
    items: Iterable[list[Any]],
) -> list[Any]:
    """
    Flatten nested lists.
    """

    return [
        item
        for sublist in items
        for item in sublist
    ]



def mask_string(
    value: str,
    visible_chars: int = 4,
) -> str:
    """
    Mask sensitive strings.

    Example:
    abcdefgh -> abcd****
    """

    if len(value) <= visible_chars:
        return "*" * len(value)


    return (
        value[:visible_chars]
        + "*" * (
            len(value)
            - visible_chars
        )
    )



def is_valid_uuid(
    value: str,
) -> bool:
    """
    Validate UUID string.
    """

    try:
        UUID(value)
        return True

    except ValueError:
        return False



def deep_merge(
    first: dict[str, Any],
    second: dict[str, Any],
) -> dict[str, Any]:
    """
    Merge nested dictionaries.
    """

    result = first.copy()

    for key, value in second.items():

        if (
            key in result
            and isinstance(result[key], dict)
            and isinstance(value, dict)
        ):
            result[key] = deep_merge(
                result[key],
                value,
            )

        else:
            result[key] = value

    return result