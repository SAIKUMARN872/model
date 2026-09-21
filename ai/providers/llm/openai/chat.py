from __future__ import annotations

import time
from typing import Any

from ...base.request import ChatRequest
from ...base.response import ChatResponse

from .client import OpenAIClient


class OpenAIChat:
    """Translate ModelNow chat requests into OpenAI Responses API calls."""

    PROVIDER_ID = "openai"

    def __init__(self, client: OpenAIClient) -> None:
        self.client = client

    @staticmethod
    def _message_to_dict(message: Any) -> dict[str, Any]:
        if isinstance(message, dict):
            return dict(message)

        role = getattr(message, "role", "user")
        content = getattr(message, "content", "")

        return {
            "role": role,
            "content": content,
        }

    @staticmethod
    def _tool_to_dict(tool: Any) -> dict[str, Any]:
        if isinstance(tool, dict):
            return dict(tool)

        if hasattr(tool, "model_dump"):
            return tool.model_dump(exclude_none=True)

        if hasattr(tool, "dict"):
            return tool.dict(exclude_none=True)

        result: dict[str, Any] = {}

        for field in ("type", "name", "description", "parameters"):
            value = getattr(tool, field, None)
            if value is not None:
                result[field] = value

        return result

    def build_payload(self, request: ChatRequest) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "model": request.model,
            "input": [
                self._message_to_dict(message)
                for message in request.messages
            ],
        }

        if request.temperature is not None:
            payload["temperature"] = request.temperature

        if request.max_tokens is not None:
            payload["max_output_tokens"] = request.max_tokens

        if request.top_p is not None:
            payload["top_p"] = request.top_p

        if request.tools:
            payload["tools"] = [
                self._tool_to_dict(tool)
                for tool in request.tools
            ]

        if request.tool_choice is not None:
            payload["tool_choice"] = request.tool_choice

        if request.response_format is not None:
            payload["text"] = {
                "format": request.response_format
            }

        if request.stop is not None:
            payload["stop"] = request.stop

        if request.user is not None:
            payload["metadata"] = {
                "modelnow_user": request.user
            }

        if request.metadata:
            existing = payload.setdefault("metadata", {})
            existing.update(
                {
                    str(key): str(value)
                    for key, value in request.metadata.items()
                }
            )

        return payload

    @staticmethod
    def _extract_content(response: Any) -> str:
        output_text = getattr(response, "output_text", None)

        if output_text:
            return str(output_text)

        output = getattr(response, "output", None)

        if not output:
            return ""

        parts: list[str] = []

        for item in output:
            content_items = getattr(item, "content", None) or []

            for content in content_items:
                text = getattr(content, "text", None)

                if text:
                    parts.append(str(text))
                    continue

                if isinstance(content, dict):
                    text = content.get("text")
                    if text:
                        parts.append(str(text))

        return "".join(parts)

    @staticmethod
    def _extract_tool_calls(response: Any) -> list[dict[str, Any]]:
        output = getattr(response, "output", None) or []
        tool_calls: list[dict[str, Any]] = []

        for item in output:
            item_type = getattr(item, "type", None)

            if item_type not in (
                "function_call",
                "custom_tool_call",
            ):
                continue

            if hasattr(item, "model_dump"):
                data = item.model_dump(exclude_none=True)
            else:
                data = {}

                for field in (
                    "type",
                    "id",
                    "call_id",
                    "name",
                    "arguments",
                    "input",
                ):
                    value = getattr(item, field, None)
                    if value is not None:
                        data[field] = value

            tool_calls.append(data)

        return tool_calls

    @staticmethod
    def _extract_usage(response: Any) -> Any:
        return getattr(response, "usage", None)

    @staticmethod
    def _usage_values(usage: Any) -> tuple[int, int, int]:
        if usage is None:
            return 0, 0, 0

        input_tokens = int(
            getattr(usage, "input_tokens", 0) or 0
        )
        output_tokens = int(
            getattr(usage, "output_tokens", 0) or 0
        )
        total_tokens = int(
            getattr(usage, "total_tokens", 0)
            or (input_tokens + output_tokens)
        )

        return input_tokens, output_tokens, total_tokens

    @staticmethod
    def _finish_reason(response: Any) -> str | None:
        status = getattr(response, "status", None)

        if status:
            return str(status)

        return None

    async def create(self, request: ChatRequest) -> ChatResponse:
        started = time.perf_counter()

        payload = self.build_payload(request)

        response = await self.client.request(
            method="POST",
            path="/responses",
            json=payload,
        )

        latency_ms = (
            time.perf_counter() - started
        ) * 1000.0

        return self.to_chat_response(
            request=request,
            response=response,
            latency_ms=latency_ms,
        )

    def to_chat_response(
        self,
        *,
        request: ChatRequest,
        response: Any,
        latency_ms: float,
    ) -> ChatResponse:
        usage = self._extract_usage(response)

        input_tokens, output_tokens, total_tokens = (
            self._usage_values(usage)
        )

        from ...base.response import ChatUsage

        chat_usage = ChatUsage(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
        )

        response_id = getattr(response, "id", None)

        return ChatResponse(
            provider=self.PROVIDER_ID,
            model=request.model,
            content=self._extract_content(response),
            usage=chat_usage,
            latency_ms=latency_ms,
            finish_reason=self._finish_reason(response),
            request_id=str(response_id)
            if response_id is not None
            else str(request.request_id),
            tool_calls=self._extract_tool_calls(response),
            raw_response=response,
            metadata={
                "openai_response_id": response_id,
            },
        )


__all__ = ["OpenAIChat"]





