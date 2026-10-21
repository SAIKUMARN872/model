from __future__ import annotations

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse

from .client import OpenRouterClient
from .utils import parse_response, request_to_payload


class OpenRouterChat:
    def __init__(
        self,
        client: OpenRouterClient,
    ) -> None:
        self.client = client

    async def complete(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        payload = request_to_payload(request)

        data = await self.client.chat(payload)

        return parse_response(
            data,
            deployment=request.model,
        )
