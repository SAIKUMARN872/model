from __future__ import annotations

from ...base.request import ChatRequest
from ...base.response import (
    ChatResponse,
    ChatUsage,
)

from .client import GoogleClient
from .utils import (
    build_chat_payload,
    extract_content,
    extract_finish_reason,
    extract_request_id,
    extract_tool_calls,
    extract_usage,
)


class GoogleChat:
    """Google Gemini chat adapter for ModelNow."""

    def __init__(
        self,
        client: GoogleClient,
    ) -> None:
        self.client = client

    async def create(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        payload = build_chat_payload(
            request
        )

        raw_response = self.client.generate_content(
            request.model,
            payload,
        )

        usage_data = extract_usage(
            raw_response
        )

        usage = ChatUsage(
            input_tokens=usage_data[
                "input_tokens"
            ],
            output_tokens=usage_data[
                "output_tokens"
            ],
            total_tokens=usage_data[
                "total_tokens"
            ],
            estimated_cost=usage_data[
                "estimated_cost"
            ],
            cached_input_tokens=usage_data[
                "cached_input_tokens"
            ],
            reasoning_tokens=usage_data[
                "reasoning_tokens"
            ],
            metadata=usage_data[
                "metadata"
            ],
        )

        return ChatResponse(
            provider="google",
            model=request.model,
            content=extract_content(
                raw_response
            ),
            usage=usage,
            finish_reason=extract_finish_reason(
                raw_response
            ),
            request_id=extract_request_id(
                raw_response
            ),
            tool_calls=extract_tool_calls(
                raw_response
            ),
            raw_response=raw_response,
        )


__all__ = ["GoogleChat"]
