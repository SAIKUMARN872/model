from __future__ import annotations

import json
from typing import Any

from ...base.request import ChatRequest
from ...base.response import ChatUsage


def json_dumps(value: Any) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        default=str,
    )


def is_retryable_status(
    status_code: int,
) -> bool:
    return (
        status_code == 408
        or status_code == 409
        or status_code == 429
        or status_code >= 500
    )


def build_chat_payload(
    request: ChatRequest,
) -> dict[str, Any]:
    contents: list[dict[str, Any]] = []
    system_instruction: dict[str, Any] | None = None

    for message in request.messages:
        role = message.role.strip().lower()

        if role == "system":
            system_instruction = {
                "parts": [
                    {
                        "text": message.content,
                    }
                ]
            }
            continue

        google_role = (
            "model"
            if role == "assistant"
            else "user"
        )

        contents.append(
            {
                "role": google_role,
                "parts": [
                    {
                        "text": message.content,
                    }
                ],
            }
        )

    payload: dict[str, Any] = {
        "contents": contents,
    }

    if system_instruction is not None:
        payload["systemInstruction"] = system_instruction

    generation_config: dict[str, Any] = {}

    if request.temperature is not None:
        generation_config["temperature"] = (
            request.temperature
        )

    if request.max_tokens is not None:
        generation_config["maxOutputTokens"] = (
            request.max_tokens
        )

    if request.top_p is not None:
        generation_config["topP"] = request.top_p

    if request.stop is not None:
        if isinstance(request.stop, str):
            generation_config["stopSequences"] = [
                request.stop
            ]
        else:
            generation_config["stopSequences"] = list(
                request.stop
            )

    if request.response_format is not None:
        response_format = request.response_format

        if isinstance(response_format, dict):
            response_type = response_format.get(
                "type"
            )

            if response_type == "json_object":
                generation_config[
                    "responseMimeType"
                ] = "application/json"

                schema = response_format.get(
                    "schema"
                )

                if isinstance(schema, dict):
                    generation_config[
                        "responseSchema"
                    ] = schema

    if generation_config:
        payload["generationConfig"] = (
            generation_config
        )

    if request.tools:
        function_declarations = []

        for tool in request.tools:
            function_declarations.append(
                {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.parameters,
                }
            )

        payload["tools"] = [
            {
                "functionDeclarations": (
                    function_declarations
                )
            }
        ]

    if request.tool_choice is not None:
        tool_choice = request.tool_choice

        if isinstance(tool_choice, str):
            mode = tool_choice.strip().upper()

            mode_mapping = {
                "AUTO": "AUTO",
                "ANY": "ANY",
                "NONE": "NONE",
            }

            if mode in mode_mapping:
                payload["toolConfig"] = {
                    "functionCallingConfig": {
                        "mode": mode_mapping[mode],
                    }
                }

        elif isinstance(tool_choice, dict):
            payload["toolConfig"] = tool_choice

    return payload


def extract_content(
    response: dict[str, Any],
) -> str:
    candidates = response.get(
        "candidates",
        [],
    )

    if not isinstance(
        candidates,
        list,
    ) or not candidates:
        return ""

    candidate = candidates[0]

    if not isinstance(
        candidate,
        dict,
    ):
        return ""

    content = candidate.get(
        "content",
        {},
    )

    if not isinstance(
        content,
        dict,
    ):
        return ""

    parts = content.get(
        "parts",
        [],
    )

    if not isinstance(
        parts,
        list,
    ):
        return ""

    text_parts: list[str] = []

    for part in parts:
        if not isinstance(
            part,
            dict,
        ):
            continue

        text = part.get("text")

        if isinstance(
            text,
            str,
        ):
            text_parts.append(text)

    return "".join(text_parts)


def extract_finish_reason(
    response: dict[str, Any],
) -> str | None:
    candidates = response.get(
        "candidates",
        [],
    )

    if not isinstance(
        candidates,
        list,
    ) or not candidates:
        return None

    candidate = candidates[0]

    if not isinstance(
        candidate,
        dict,
    ):
        return None

    reason = candidate.get(
        "finishReason"
    )

    if reason is None:
        return None

    return str(reason)


def extract_request_id(
    response: dict[str, Any],
) -> str | None:
    request_id = response.get(
        "responseId"
    )

    if request_id is None:
        request_id = response.get("id")

    if request_id is None:
        return None

    return str(request_id)


def extract_tool_calls(
    response: dict[str, Any],
) -> list[dict[str, Any]]:
    candidates = response.get(
        "candidates",
        [],
    )

    if not isinstance(
        candidates,
        list,
    ) or not candidates:
        return []

    candidate = candidates[0]

    if not isinstance(
        candidate,
        dict,
    ):
        return []

    content = candidate.get(
        "content",
        {},
    )

    if not isinstance(
        content,
        dict,
    ):
        return []

    parts = content.get(
        "parts",
        [],
    )

    if not isinstance(
        parts,
        list,
    ):
        return []

    tool_calls: list[dict[str, Any]] = []

    for part in parts:
        if not isinstance(
            part,
            dict,
        ):
            continue

        function_call = part.get(
            "functionCall"
        )

        if not isinstance(
            function_call,
            dict,
        ):
            continue

        name = function_call.get(
            "name",
            "",
        )

        args = function_call.get(
            "args",
            {},
        )

        tool_calls.append(
            {
                "type": "function",
                "function": {
                    "name": str(name),
                    "arguments": json_dumps(args),
                },
            }
        )

    return tool_calls


def extract_usage(
    response: dict[str, Any],
) -> dict[str, Any]:
    usage = response.get(
        "usageMetadata",
        {},
    )

    if not isinstance(
        usage,
        dict,
    ):
        usage = {}

    input_tokens = _first_int(
        usage.get(
            "promptTokenCount"
        ),
        usage.get(
            "inputTokenCount"
        ),
    )

    output_tokens = _first_int(
        usage.get(
            "candidatesTokenCount"
        ),
        usage.get(
            "outputTokenCount"
        ),
    )

    total_tokens = _first_int(
        usage.get(
            "totalTokenCount"
        )
    )

    if total_tokens == 0:
        total_tokens = (
            input_tokens
            + output_tokens
        )

    cached_input_tokens = _first_int(
        usage.get(
            "cachedContentTokenCount"
        ),
        usage.get(
            "cachedInputTokenCount"
        ),
    )

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "estimated_cost": 0.0,
        "cached_input_tokens": (
            cached_input_tokens
        ),
        "reasoning_tokens": 0,
        "metadata": {
            "source": "google",
            "raw_usage": usage,
        },
    }


def extract_stream_text(
    event: dict[str, Any],
) -> str:
    return extract_content(event)


def extract_stream_finish_reason(
    event: dict[str, Any],
) -> str | None:
    return extract_finish_reason(event)


def extract_stream_usage(
    event: dict[str, Any],
) -> ChatUsage | None:
    usage = event.get(
        "usageMetadata"
    )

    if not isinstance(
        usage,
        dict,
    ):
        return None

    normalized = extract_usage(
        {
            "usageMetadata": usage,
        }
    )

    return ChatUsage(
        input_tokens=normalized[
            "input_tokens"
        ],
        output_tokens=normalized[
            "output_tokens"
        ],
        total_tokens=normalized[
            "total_tokens"
        ],
        estimated_cost=normalized[
            "estimated_cost"
        ],
        cached_input_tokens=normalized[
            "cached_input_tokens"
        ],
        reasoning_tokens=normalized[
            "reasoning_tokens"
        ],
        metadata=normalized[
            "metadata"
        ],
    )


def _first_int(
    *values: Any,
) -> int:
    for value in values:
        if value is None:
            continue

        try:
            return int(value)
        except (
            TypeError,
            ValueError,
        ):
            continue

    return 0


__all__ = [
    "build_chat_payload",
    "extract_content",
    "extract_finish_reason",
    "extract_request_id",
    "extract_stream_finish_reason",
    "extract_stream_text",
    "extract_stream_usage",
    "extract_tool_calls",
    "extract_usage",
    "is_retryable_status",
    "json_dumps",
]
