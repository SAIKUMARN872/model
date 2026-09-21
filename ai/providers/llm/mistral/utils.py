@'
import json
import time
from typing import Any, Dict, List


def normalize_messages(messages: List[Any]) -> List[Dict[str, Any]]:
    normalized = []

    for message in messages:
        if hasattr(message, "role"):
            role = message.role
            content = message.content
        else:
            role = message.get("role")
            content = message.get("content")

        normalized.append(
            {
                "role": role,
                "content": content,
            }
        )

    return normalized


def build_chat_payload(
    model: str,
    messages: List[Any],
    temperature: float = 0.2,
    max_tokens: int | None = None,
    stream: bool = False,
    tools: Any = None,
    metadata: Dict[str, Any] | None = None,
) -> Dict[str, Any]:

    payload: Dict[str, Any] = {
        "model": model,
        "messages": normalize_messages(messages),
        "temperature": temperature,
        "stream": stream,
    }

    if max_tokens is not None:
        payload["max_tokens"] = max_tokens

    if tools:
        payload["tools"] = tools

    if metadata:
        if metadata.get("reasoning_effort"):
            payload["reasoning_effort"] = metadata["reasoning_effort"]

        if metadata.get("response_format"):
            payload["response_format"] = metadata["response_format"]

        if metadata.get("safe_prompt") is not None:
            payload["safe_prompt"] = metadata["safe_prompt"]

        if metadata.get("random_seed") is not None:
            payload["random_seed"] = metadata["random_seed"]

        if metadata.get("top_p") is not None:
            payload["top_p"] = metadata["top_p"]

        if metadata.get("prompt_cache_key"):
            payload["prompt_cache_key"] = metadata["prompt_cache_key"]

    return payload


def extract_text(data: Dict[str, Any]) -> str:
    choices = data.get("choices") or []

    if not choices:
        return ""

    message = choices[0].get("message") or {}
    content = message.get("content", "")

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts = []

        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                parts.append(item.get("text", ""))

        return "".join(parts)

    return str(content)


def extract_reasoning(data: Dict[str, Any]) -> str:
    choices = data.get("choices") or []

    if not choices:
        return ""

    message = choices[0].get("message") or {}

    return (
        message.get("reasoning_content")
        or message.get("reasoning")
        or ""
    )


def extract_usage(data: Dict[str, Any]) -> Dict[str, int]:
    usage = data.get("usage") or {}

    return {
        "input_tokens": usage.get(
            "prompt_tokens",
            usage.get("input_tokens", 0),
        ),
        "output_tokens": usage.get(
            "completion_tokens",
            usage.get("output_tokens", 0),
        ),
        "total_tokens": usage.get(
            "total_tokens",
            0,
        ),
    }


def extract_finish_reason(data: Dict[str, Any]) -> str | None:
    choices = data.get("choices") or []

    if not choices:
        return None

    return choices[0].get("finish_reason")


def extract_request_id(data: Dict[str, Any]) -> str | None:
    return data.get("id")


def calculate_latency_ms(start_time: float) -> float:
    return round((time.perf_counter() - start_time) * 1000, 2)


def calculate_cost(
    input_tokens: int,
    output_tokens: int,
    input_price_per_million: float,
    output_price_per_million: float,
) -> float:
    return (
        (input_tokens / 1_000_000) * input_price_per_million
        + (output_tokens / 1_000_000) * output_price_per_million
    )


def is_retryable_status(status_code: int) -> bool:
    return status_code in {408, 409, 429, 500, 502, 503, 504}


def json_dumps(payload: Dict[str, Any]) -> bytes:
    return json.dumps(
        payload,
        ensure_ascii=False,
    ).encode("utf-8")
'@ | Set-Content .\ai\providers\llm\mistral\utils.py