from __future__ import annotations

import time
from typing import Any

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse

from .utils import parse_response, request_to_payload


class AzureOpenAIChat:
    def __init__(self, client: Any) -> None:
        self.client = client

    async def execute(self, request: ChatRequest) -> ChatResponse:
        started = time.perf_counter()

        payload = request_to_payload(request)
        response = await self.client.request(
            deployment=request.model,
            payload=payload,
        )

        latency_ms = (time.perf_counter() - started) * 1000.0

        return parse_response(
            response["data"],
            deployment=request.model,
            request_id=response.get("request_id"),
            latency_ms=latency_ms,
        )
