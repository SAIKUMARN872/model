from __future__ import annotations

import json
import time
from typing import Any, Dict, Iterable, List, Optional


def normalize_model_name(model: str) -> str:
    """
    Normalize an OpenAI model identifier.

    ModelNow keeps provider-specific model IDs as strings so that
    new OpenAI models can be added without changing the provider API.
    """
    if not isinstance(model, str):
        raise TypeError("model must be a string")

    normalized = model.strip()

    if not normalized:
        raise ValueError("model cannot be empty")

    return normalized


def normalize_messages(messages: Iterable[Any]) -> List[Dict[str, Any]]:
    """
    Convert ModelNow ProviderMessage objects or dictionaries into
    OpenAI-compatible message dictionaries.
    """
    normalized: List[Dict[str, Any]] = []

    for message in messages:
        if hasattr(message, "role") and hasattr(message, "content"):
            role = message.role
            content = message.content

        elif isinstance(message, dict):
            role = message.get("role")
            content = message.get("content")

        else:
            raise TypeError(
                "Each message must be a ProviderMessage or dictionary."
            )

        if not role:
            raise ValueError("Message role cannot be empty.")

        normalized.append(
            {
                "role": str(role),
                "content": content,
            }
        )

    return normalized


def build_chat_payload(
    model: str,
    messages: Iterable[Any],
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    stream: bool = False,
    tools: Optional[List[Dict[str, Any]]] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Build a normalized OpenAI chat request payload.

    Provider-specific request construction stays inside the OpenAI
    provider package rather than leaking into the routing engine.
    """
    payload: Dict[str, Any] = {
        "model": normalize_model_name(model),
        "messages": normalize_messages(messages),
    }

    if temperature is not None:
        payload["temperature"] = temperature

    if max_tokens is not None:
        payload["max_tokens"] = max_tokens

    if stream:
        payload["stream"] = True

    if tools:
        payload["tools"] = tools

    if metadata:
        payload["metadata"] = metadata

    return payload


def extract_text(response: Dict[str, Any]) -> str:
    """
    Extract assistant text from a normalized OpenAI response.
    """
    choices = response.get("choices") or []

    if not choices:
        return ""

    first_choice = choices[0] or {}
    message = first_choice.get("message") or {}

    content = message.get("content")

    if content is None:
        return ""

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: List[str] = []

        for item in content:
            if not isinstance(item, dict):
                continue

            text = item.get("text")

            if isinstance(text, str):
                parts.append(text)

        return "".join(parts)

    return str(content)


def extract_usage(response: Dict[str, Any]) -> Dict[str, int]:
    """
    Extract token usage from an OpenAI response.

    Supports the standard prompt/completion/total token fields and
    safely handles missing usage data.
    """
    usage = response.get("usage") or {}

    input_tokens = int(
        usage.get(
            "prompt_tokens",
            usage.get("input_tokens", 0),
        )
        or 0
    )

    output_tokens = int(
        usage.get(
            "completion_tokens",
            usage.get("output_tokens", 0),
        )
        or 0
    )

    total_tokens = int(
        usage.get(
            "total_tokens",
            input_tokens + output_tokens,
        )
        or 0
    )

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
    }


def extract_finish_reason(response: Dict[str, Any]) -> Optional[str]:
    """
    Extract the completion finish reason.
    """
    choices = response.get("choices") or []

    if not choices:
        return None

    return choices[0].get("finish_reason")


def extract_request_id(response: Dict[str, Any]) -> Optional[str]:
    """
    Extract provider request ID when available.
    """
    value = response.get("id")

    if value is None:
        return None

    return str(value)


def extract_system_fingerprint(
    response: Dict[str, Any],
) -> Optional[str]:
    """
    Extract OpenAI system fingerprint when available.
    """
    value = response.get("system_fingerprint")

    if value is None:
        return None

    return str(value)


def serialize_json(value: Any) -> str:
    """
    Safely serialize a Python value to JSON.
    """
    return json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        default=str,
    )


def estimate_latency_ms(start_time: float) -> float:
    """
    Calculate elapsed request latency in milliseconds.
    """
    return max(0.0, (time.perf_counter() - start_time) * 1000.0)


def calculate_cost(
    input_tokens: int,
    output_tokens: int,
    input_cost_per_1m_tokens: float = 0.0,
    output_cost_per_1m_tokens: float = 0.0,
) -> float:
    """
    Calculate estimated provider cost.

    Pricing is intentionally supplied by ModelNow's pricing/registry
    layer instead of being hardcoded into the OpenAI client.
    """
    input_cost = (
        input_tokens / 1_000_000
    ) * input_cost_per_1m_tokens

    output_cost = (
        output_tokens / 1_000_000
    ) * output_cost_per_1m_tokens

    return input_cost + output_cost


def merge_metadata(
    base: Optional[Dict[str, Any]],
    extra: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Merge provider metadata without mutating either input dictionary.
    """
    result: Dict[str, Any] = {}

    if base:
        result.update(base)

    if extra:
        result.update(extra)

    return result


def is_retryable_status(status_code: int) -> bool:
    """
    Determine whether an HTTP status commonly represents a transient
    provider failure.

    Final retry policy remains controlled by ModelNow's provider
    retry/rate-limit layers.
    """
    return status_code in {
        408,  # Request Timeout
        409,  # Conflict
        429,  # Rate Limit
        500,  # Internal Server Error
        502,  # Bad Gateway
        503,  # Service Unavailable
        504,  # Gateway Timeout
    }