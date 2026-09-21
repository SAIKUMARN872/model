@'
from __future__ import annotations

from typing import Any

from ai.providers.base.request import ProviderMessage, ProviderRequest


def normalize_messages(
    messages: list[ProviderMessage],
) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []

    for message in messages:
        result.append(
            {
                "role": message.role,
                "content": message.content,
            }
        )

    return result


def build_chat_payload(
    request: ProviderRequest,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": request.model,
        "messages": normalize_messages(request.messages),
    }

    if request.temperature is not None:
        payload["temperature"] = request.temperature

    if request.max_tokens is not None:
        payload["max_tokens"] = request.max_tokens

    if request.stream:
        payload["stream"] = True
        payload["stream_options"] = {
            "include_usage": True,
        }

    if request.tools:
        payload["tools"] = request.tools

    if request.metadata:
        for key in (
            "response_format",
            "tool_choice",
            "reasoning_effort",
            "user",
        ):
            if key in request.metadata:
                payload[key] = request.metadata[key]

    return payload


def extract_text(response: dict[str, Any]) -> str:
    choices = response.get("choices") or []

    if not choices:
        return ""

    message = choices[0].get("message") or {}
    content = message.get("content")

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []

        for item in content:
            if isinstance(item, dict):
                text = item.get("text")
                if isinstance(text, str):
                    parts.append(text)

        return "".join(parts)

    return ""


def extract_usage(response: dict[str, Any]) -> dict[str, int]:
    usage = response.get("usage") or {}

    return {
        "input_tokens": int(
            usage.get("prompt_tokens", usage.get("input_tokens", 0)) or 0
        ),
        "output_tokens": int(
            usage.get("completion_tokens", usage.get("output_tokens", 0))
            or 0
        ),
        "total_tokens": int(
            usage.get("total_tokens", 0)
            or (
                int(
                    usage.get(
                        "prompt_tokens",
                        usage.get("input_tokens", 0),
                    )
                    or 0
                )
                + int(
                    usage.get(
                        "completion_tokens",
                        usage.get("output_tokens", 0),
                    )
                    or 0
                )
            )
        ),
    }


def extract_finish_reason(response: dict[str, Any]) -> str | None:
    choices = response.get("choices") or []

    if not choices:
        return None

    return choices[0].get("finish_reason")


def extract_request_id(response: dict[str, Any]) -> str | None:
    return response.get("id")


def calculate_cost(
    input_tokens: int,
    output_tokens: int,
    input_cost_per_1m: float = 0.0,
    output_cost_per_1m: float = 0.0,
) -> float:
    return (
        input_tokens / 1_000_000 * input_cost_per_1m
        + output_tokens / 1_000_000 * output_cost_per_1m
    )
'@ | Set-Content .\ai\providers\llm\azure_openai\utils.py -Encoding UTF8