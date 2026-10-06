from __future__ import annotations

from collections.abc import AsyncIterator
from uuid import UUID, uuid4

from ....providers.base.provider import BaseProvider
from ....providers.base.request import (
    ChatMessage,
    ChatRequest,
    ToolDefinition,
)
from ....providers.base.response import (
    ChatResponse,
    StreamChunk,
)

from ...models import (
    InferenceBackendType,
    InferenceRequest,
    InferenceResult,
    InferenceUsage,
)


class TransformersClient:
    """Adapter between ModelNow inference requests and providers."""

    def __init__(
        self,
        providers: list[BaseProvider] | None = None,
    ) -> None:
        self._providers = list(providers or [])

    @property
    def providers(self) -> tuple[BaseProvider, ...]:
        return tuple(self._providers)

    def add_provider(
        self,
        provider: BaseProvider,
    ) -> None:
        self._providers.append(provider)

    async def _find_provider(
        self,
        model: str,
    ) -> BaseProvider:
        for provider in self._providers:
            if await provider.supports_model(model):
                return provider

        raise LookupError(
            f"No provider supports model: {model}"
        )

    @staticmethod
    def _to_chat_request(
        request: InferenceRequest,
    ) -> ChatRequest:
        messages = [
            ChatMessage(
                role=str(message.get("role", "user")),
                content=str(
                    message.get("content", "")
                ),
                name=message.get("name"),
                tool_call_id=message.get(
                    "tool_call_id"
                ),
                metadata=dict(
                    message.get("metadata", {})
                ),
            )
            for message in request.messages
        ]

        tools = [
            ToolDefinition(
                name=str(tool.get("name", "")),
                description=str(
                    tool.get("description", "")
                ),
                parameters=dict(
                    tool.get("parameters", {})
                ),
            )
            for tool in (request.tools or [])
        ]

        request_id = (
            UUID(request.request_id)
            if request.request_id
            else uuid4()
        )

        return ChatRequest(
            model=request.model,
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            top_p=request.top_p,
            stream=request.stream,
            tools=tools,
            response_format=request.response_format,
            stop=request.stop,
            seed=request.seed,
            request_id=request_id,
            metadata=dict(request.metadata),
        )

    @staticmethod
    def _to_stream_request(
        request: InferenceRequest,
    ) -> InferenceRequest:
        return InferenceRequest(
            model=request.model,
            messages=list(request.messages),
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            top_p=request.top_p,
            stream=True,
            tools=(
                list(request.tools)
                if request.tools
                else None
            ),
            response_format=(
                dict(request.response_format)
                if request.response_format
                else None
            ),
            stop=(
                list(request.stop)
                if isinstance(request.stop, list)
                else request.stop
            ),
            seed=request.seed,
            request_id=request.request_id,
            metadata=dict(request.metadata),
        )

    @staticmethod
    def _usage_from_chat(
        usage,
    ) -> InferenceUsage:
        return InferenceUsage(
            input_tokens=usage.input_tokens,
            output_tokens=usage.output_tokens,
            total_tokens=usage.total_tokens,
            estimated_cost=usage.estimated_cost,
        )

    @staticmethod
    def _to_result(
        response: ChatResponse,
    ) -> InferenceResult:
        return InferenceResult(
            request_id=response.request_id,
            model=response.model,
            backend=InferenceBackendType.TRANSFORMERS,
            content=response.content,
            usage=TransformersClient._usage_from_chat(
                response.usage
            ),
            latency_ms=response.latency_ms,
            time_to_first_token_ms=(
                response.time_to_first_token_ms
            ),
            finish_reason=response.finish_reason,
            tool_calls=list(response.tool_calls),
            metadata={
                "provider": response.provider,
                **response.metadata,
            },
        )

    @staticmethod
    def _chunk_to_result(
        chunk: StreamChunk,
    ) -> InferenceResult:
        usage = (
            TransformersClient._usage_from_chat(
                chunk.usage
            )
            if chunk.usage is not None
            else InferenceUsage()
        )

        metadata = dict(chunk.metadata)

        ttft_ms = metadata.get(
            "time_to_first_token_ms"
        )
        latency_ms = metadata.get(
            "generation_latency_ms"
        )

        return InferenceResult(
            request_id=chunk.request_id,
            model=chunk.model or "",
            backend=InferenceBackendType.TRANSFORMERS,
            content=chunk.content,
            usage=usage,
            latency_ms=(
                float(latency_ms)
                if latency_ms is not None
                else None
            ),
            time_to_first_token_ms=(
                float(ttft_ms)
                if ttft_ms is not None
                else None
            ),
            finish_reason=chunk.finish_reason,
            tool_calls=list(chunk.tool_calls),
            metadata=metadata,
        )

    async def infer(
        self,
        request: InferenceRequest,
    ) -> InferenceResult:
        provider = await self._find_provider(
            request.model
        )

        if not provider.initialized:
            await provider.initialize()

        chat_request = self._to_chat_request(request)
        response = await provider.chat(chat_request)

        return self._to_result(response)

    async def stream(
        self,
        request: InferenceRequest,
    ) -> AsyncIterator[InferenceResult]:
        provider = await self._find_provider(
            request.model
        )

        if not provider.initialized:
            await provider.initialize()

        stream_request = self._to_stream_request(
            request
        )

        chat_request = self._to_chat_request(
            stream_request
        )

        async for chunk in provider.stream(
            chat_request
        ):
            yield self._chunk_to_result(chunk)


__all__ = ["TransformersClient"]
