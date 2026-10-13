from __future__ import annotations

import re


def validate_prompt(prompt: str) -> str:
    if not isinstance(prompt, str):
        raise TypeError("prompt must be a string")
    if not prompt.strip():
        raise ValueError("prompt must not be empty")
    return prompt


def normalize_whitespace(prompt: str) -> str:
    """Trim line edges and collapse repeated blank lines."""
    validate_prompt(prompt)
    lines = prompt.strip().splitlines()
    result: list[str] = []
    blank_pending = False

    for line in lines:
        normalized = line.strip()

        if not normalized:
            blank_pending = True
            continue

        if blank_pending and result:
            result.append("")

        result.append(normalized)
        blank_pending = False

    return "\n".join(result)


def estimate_tokens(text: str) -> int:
    """Return a rough whitespace-delimited token estimate, not a model tokenizer count."""
    if not isinstance(text, str):
        raise TypeError("text must be a string")
    return len(text.split())


def remove_duplicate_lines(prompt: str) -> str:
    """Remove repeated non-empty lines while preserving unique-line order."""
    validate_prompt(prompt)
    seen: set[str] = set()
    output: list[str] = []
    blank_pending = False

    for line in prompt.splitlines():
        normalized = line.strip()

        if not normalized:
            blank_pending = True
            continue

        if normalized in seen:
            # Drop pending blank lines when the next line is a duplicate.
            blank_pending = False
            continue

        if blank_pending and output:
            output.append("")

        output.append(normalized)
        seen.add(normalized)
        blank_pending = False

    return "\n".join(output)


def reduction_percentage(before: int, after: int) -> float:
    if isinstance(before, bool) or isinstance(after, bool):
        raise ValueError("token counts must be integers")
    if not isinstance(before, int) or not isinstance(after, int):
        raise ValueError("token counts must be integers")
    if before < 0 or after < 0:
        raise ValueError("token counts must not be negative")
    if before == 0:
        return 0.0
    return round(max(0, before - after) * 100.0 / before, 2)
