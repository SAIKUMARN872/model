from __future__ import annotations

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse

from .client import AWSBedrockClient
from .utils import (
    parse_response,
    request_to_converse_payload,
)


class AWSBedrockChat:
    def __init__(
        self,
        client: AWSBedrockClient,
    ) -> None:
        self.client = client

    async def complete(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        payload = request_to_converse_payload(
            request
        )

        response = await self.client.chat(
            payload
        )

        return parse_response(
            response=response,
            model=request.model,
            request_id=str(
                request.request_id
            ),
        )
