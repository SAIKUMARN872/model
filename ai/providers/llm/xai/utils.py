@'
import json
import time
from typing import Any, Dict, List


def normalize_input(messages: List[Any]) -> List[Dict[str, Any]]:
    result = []

    for message in messages:
        if hasattr(message, "role"):
            role = message.role
            content = message.content
        else:
            role = message.get("role")
            content = message.get("content", "")

        result.append(
            {
                "role": role,
                "content": content,
            }
        )

    return result


def build_response_payload(
    model: str,
    messages: List[Any],
    temperature: float = 0.2,
    max_tokens: int | None = None,
    stream: bool = False,
    tools: Any = None,
    metadata: Dict[str, Any] | None = None,
) -> Dict[str, Any]:

    metadata = metadata or {}

    payload: Dict[str, Any] = {
        "model": model,
        "input": normalize_input(messages),
        "stream": stream,
    }

    if max_tokens is not None:
        payload["max_output_tokens"] = max_tokens

    if temperature is not None:
        payload["temperature"] = temperature

    if tools:
        payload["tools"] = tools

    if metadata.get("reasoning_effort"):
        payload["reasoning"] = {
            "effort": metadata["reasoning_effort"]
        }

    if metadata.get("previous_response_id"):
        payload["previous_response_id"] = (
            metadata["previous_response_id"]
        )

    if metadata.get("store") is not None:
        payload["store"] = metadata["store"]

    if metadata.get("prompt_cache_key"):
        payload["prompt_cache_key"] = metadata["prompt_cache_key"]

    if metadata.get("service_tier"):
        payload["service_tier"] = metadata["service_tier"]

    if metadata.get("include"):
        payload["include"] = metadata["include"]

    return payload


def extract_text(data: Dict[str, Any]) -> str:
    parts = []

    for item in data.get("output", []) or []:
        if item.get("type") != "message":
            continue

        for content in item.get("content", []) or []:
            if content.get("type") == "output_text":
                text = content.get("text", "")
                if text:
                    parts.append(text)

    return "".join(parts)


def extract_reasoning(data: Dict[str, Any]) -> str:
    reasoning = data.get("reasoning") or {}

    summary = reasoning.get("summary")

    if isinstance(summary, list):
        return "\n".join(
            item.get("text", "")
            for item in summary
            if isinstance(item, dict)
        )

    if isinstance(summary, str):
        return summary

    return ""


def extract_usage(data: Dict[str, Any]) -> Dict[str, int]:
    usage = data.get("usage") or {}

    input_details = usage.get("input_tokens_details") or {}
    output_details = usage.get("output_tokens_details") or {}

    return {
        "input_tokens": usage.get("input_tokens", 0),
        "output_tokens": usage.get("output_tokens", 0),
        "total_tokens": usage.get("total_tokens", 0),
        "cached_tokens": input_details.get("cached_tokens", 0),
        "reasoning_tokens": output_details.get(
            "reasoning_tokens",
            0,
        ),
    }


def extract_request_id(data: Dict[str, Any]) -> str | None:
    return data.get("id")


def extract_status(data: Dict[str, Any]) -> str | None:
    return data.get("status")


def calculate_latency_ms(start_time: float) -> float:
    return round(
        (time.perf_counter() - start_time) * 1000,
        2,
    )


def extract_cost_ticks(data: Dict[str, Any]) -> int:
    usage = data.get("usage") or {}
    return int(
        usage.get(
            "cost_in_usd_ticks",
            0,
        )
    )


def calculate_cost_from_ticks(ticks: int) -> float:
    return ticks / 10_000_000


def is_retryable_status(status_code: int) -> bool:
    return status_code in {
        408,
        409,
        429,
        500,
        502,
        503,
        504,
    }


def json_dumps(payload: Dict[str, Any]) -> bytes:
    return json.dumps(
        payload,
        ensure_ascii=False,
    ).encode("utf-8")
'@ | Set-Content .\ai\providers\llm\xai\utils.py