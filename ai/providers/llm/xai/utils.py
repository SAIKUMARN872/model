from __future__ import annotations

from typing import Any


def extract_content(response: dict[str, Any]) -> str:
    choices = response.get("choices") or []

    if not choices:
        return ""

    message = choices[0].get("message") or {}
    content = message.get("content")

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts = []

        for item in content:
            if isinstance(item, dict):
                text = item.get("text")
                if isinstance(text, str):
                    parts.append(text)

        return "".join(parts)

    return ""


def extract_usage(response: dict[str, Any]) -> dict[str, Any]:
    usage = response.get("usage")

    return usage if isinstance(usage, dict) else {}


def extract_model(response: dict[str, Any]) -> str | None:
    value = response.get("model")

    return str(value) if value else None


def extract_request_id(response: dict[str, Any]) -> str | None:
    value = response.get("id")

    return str(value) if value else None


def normalize_model_id(model_id: str) -> str:
    return model_id.strip().lower()


def is_grok_model(model_id: str) -> bool:
    return normalize_model_id(model_id).startswith("grok-")


def parse_sse_line(line: str) -> str | None:
    line = line.strip()

    if not line:
        return None

    if line.startswith("data:"):
        return line[5:].strip()

    return line


def safe_json_loads(value: str) -> dict[str, Any] | None:
    import json

    try:
        data = json.loads(value)

        return data if isinstance(data, dict) else None

    except (TypeError, json.JSONDecodeError):
        return None


def model_aliases(model_id: str) -> tuple[str, ...]:
    normalized = normalize_model_id(model_id)

    aliases = []

    if normalized == "grok-4.7":
        aliases.extend(["grok", "grok-latest"])

    elif normalized == "grok-4.6":
        aliases.append("grok-4")

    return tuple(aliases)
