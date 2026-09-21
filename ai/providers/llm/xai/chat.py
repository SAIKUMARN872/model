@'
import time

from ai.providers.base.request import ProviderRequest
from ai.providers.base.response import (
    ProviderResponse,
    ProviderUsage,
)

from .client import XAIClient
from .utils import (
    build_response_payload,
    calculate_cost_from_ticks,
    extract_cost_ticks,
    extract_reasoning,
    extract_request_id,
    extract_status,
    extract_text,
    extract_usage,
)


class XAIChat:
    def __init__(self, client: XAIClient):
        self.client = client

    def generate(
        self,
        request: ProviderRequest,
    ) -> ProviderResponse:

        start = time.perf_counter()

        payload = build_response_payload(
            model=request.model,
            messages=request.messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=False,
            tools=request.tools,
            metadata=request.metadata,
        )

        data = self.client.responses(payload)

        usage_data = extract_usage(data)

        cost_ticks = extract_cost_ticks(data)

        usage = ProviderUsage(
            input_tokens=usage_data["input_tokens"],
            output_tokens=usage_data["output_tokens"],
            total_tokens=usage_data["total_tokens"],
            estimated_cost=calculate_cost_from_ticks(
                cost_ticks
            ),
        )

        return ProviderResponse(
            provider="xai",
            model=data.get(
                "model",
                request.model,
            ),
            content=extract_text(data),
            usage=usage,
            latency_ms=round(
                (time.perf_counter() - start) * 1000,
                2,
            ),
            finish_reason=extract_status(data),
            raw_response=data,
            metadata={
                "request_id": extract_request_id(data),
                "reasoning": extract_reasoning(data),
                "cost_ticks": cost_ticks,
                "cached_tokens": usage_data[
                    "cached_tokens"
                ],
                "reasoning_tokens": usage_data[
                    "reasoning_tokens"
                ],
                "service_tier": data.get(
                    "service_tier"
                ),
            },
        )
'@ | Set-Content .\ai\providers\llm\xai\chat.py