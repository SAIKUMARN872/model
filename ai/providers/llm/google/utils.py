@'
from __future__ import annotations

import json
import time
from typing import Any, Dict, Iterable, List, Optional, Tuple


def normalize_model_name(model: str) -> str:
    if not isinstance(model, str):
        raise TypeError("model must be a string")

    value = model.strip()

    if value.startswith("models/"):
        value = value[len("models/"):]

    if not value:
        raise ValueError("model cannot be empty")

    return value


def normalize_part(content: Any) -> List[Dict[str, Any]]:
    if isinstance(content, str):
        return [{"text": content}]

    if isinstance(content, list):
        parts: List[Dict[str, Any]] = []

        for item in content:
            if isinstance(item, str):
                parts.append({"text": item})

            elif isinstance(item, dict):
                parts.append(dict(item))

            else:
                parts.append({"text": str(item)})

        return parts

    if isinstance(content, dict):
        return [dict(content)]

    return [{"text": str(content)}]


def normalize_messages(
    messages: Iterable[Any],
) -> Tuple[Optional[str], List[Dict[str, Any]]]:
    system_parts: List[str] = []
    contents: List[Dict[str, Any]] = []

    for message in messages:
        if hasattr(message, "role") and hasattr(message, "content"):
            role = message.role
            content = message.content

        elif isinstance(message, dict):
            role = message.get("role")
            content = message.get("content")

        else:
            raise TypeError(
                "Message must be ProviderMessage or dictionary."
            )

        role = str(role).strip().lower()

        if role == "system":
            if isinstance(content, str):
                system_parts.append(content)
            else:
                system_parts.append(str(content))
            continue

        if role == "assistant":
            gemini_role = "model"
        elif role == "user":
            gemini_role = "user"
        else:
            raise ValueError(
                f"Unsupported Gemini message role: {role}"
            )

        contents.append(
            {
                "role": gemini_role,
                "parts": normalize_part(content),
            }
        )

    system_instruction = (
        "\n\n".join(system_parts)
        if system_parts
        else None
    )

    return system_instruction, contents


def build_generate_payload(
    messages: Iterable[Any],
    temperature: Optional[float] = None,
    max_output_tokens: Optional[int] = None,
    tools: Optional[List[Dict[str, Any]]] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    system_instruction, contents = normalize_messages(
        messages
    )

    payload: Dict[str, Any] = {
        "contents": contents,
    }

    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [
                {
                    "text": system_instruction,
                }
            ]
        }

    generation_config: Dict[str, Any] = {}

    if temperature is not None:
        generation_config["temperature"] = temperature

    if max_output_tokens is not None:
        generation_config["maxOutputTokens"] = max_output_tokens

    if generation_config:
        payload["generationConfig"] = generation_config

    if tools:
        payload["tools"] = tools

    if metadata:
        payload["_modelnow_metadata"] = metadata

    return payload


def extract_text(response: Dict[str, Any]) -> str:
    candidates = response.get("candidates") or []

    if not candidates:
        return ""

    candidate = candidates[0] or {}
    content = candidate.get("content") or {}
    parts = content.get("parts") or []

    text_parts: List[str] = []

    for part in parts:
        if not isinstance(part, dict):
            continue

        text = part.get("text")

        if isinstance(text, str):
            text_parts.append(text)

    return "".join(text_parts)


def extract_usage(
    response: Dict[str, Any],
) -> Dict[str, int]:
    usage = response.get("usageMetadata") or {}

    input_tokens = int(
        usage.get("promptTokenCount", 0) or 0
    )

    output_tokens = int(
        usage.get("candidatesTokenCount", 0) or 0
    )

    total_tokens = int(
        usage.get(
            "totalTokenCount",
            input_tokens + output_tokens,
        )
        or 0
    )

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
    }


def extract_finish_reason(
    response: Dict[str, Any],
) -> Optional[str]:
    candidates = response.get("candidates") or []

    if not candidates:
        return None

    value = candidates[0].get("finishReason")

    if value is None:
        return None

    return str(value)


def extract_request_id(
    response: Dict[str, Any],
) -> Optional[str]:
    value = response.get("responseId")

    if value is None:
        value = response.get("id")

    return str(value) if value is not None else None


def calculate_cost(
    input_tokens: int,
    output_tokens: int,
    input_cost_per_1m_tokens: float = 0.0,
    output_cost_per_1m_tokens: float = 0.0,
) -> float:
    return (
        input_tokens / 1_000_000
    ) * input_cost_per_1m_tokens + (
        output_tokens / 1_000_000
    ) * output_cost_per_1m_tokens


def estimate_latency_ms(
    start_time: float,
) -> float:
    return max(
        0.0,
        (time.perf_counter() - start_time) * 1000.0,
    )


def is_retryable_status(
    status_code: int,
) -> bool:
    return status_code in {
        408,
        409,
        429,
        500,
        502,
        503,
        504,
    }


def serialize_json(value: Any) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        default=str,
    )
'@ | Set-Content ".\ai\providers\llm\google\utils.py" -Encoding UTF8