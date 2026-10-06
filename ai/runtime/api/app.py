from __future__ import annotations

import json
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse

from ai.runtime.bootstrap import ModelNowRuntime, create_runtime

from .schemas import ChatResponse, ChatRequest, ChatUsageResponse, ModelResponse
from .service import RuntimeService


_runtime: ModelNowRuntime | None = None
_service: RuntimeService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _runtime, _service

    _runtime = create_runtime()
    await _runtime.initialize()

    _service = RuntimeService(_runtime.adapter)

    try:
        yield
    finally:
        if _runtime is not None:
            await _runtime.close()

        _service = None
        _runtime = None


app = FastAPI(
    title="ModelNow AI Runtime",
    version="0.1.0",
    lifespan=lifespan,
)


def _get_service() -> RuntimeService:
    if _service is None:
        raise HTTPException(
            status_code=503,
            detail="ModelNow runtime is not initialized.",
        )

    return _service


@app.get("/health")
async def health() -> dict[str, object]:
    if _runtime is None:
        return {
            "status": "starting",
            "runtime": "modelnow",
        }

    return {
        "status": "ok",
        "runtime": "modelnow",
        "backends": _runtime.inference_engine.backend_types(),
        "model_count": _runtime.model_registry.count(),
    }


@app.get(
    "/models",
    response_model=list[ModelResponse],
)
async def models() -> list[ModelResponse]:
    if _runtime is None:
        raise HTTPException(
            status_code=503,
            detail="ModelNow runtime is not initialized.",
        )

    return [
        ModelResponse(
            provider=model.provider,
            model_id=model.model_id,
            display_name=model.display_name,
            tier=model.tier.value,
            context_window=model.context_window,
            max_output_tokens=model.max_output_tokens,
            enabled=model.enabled,
            available=model.available,
        )
        for model in _runtime.model_registry.list_models()
    ]


def _response(result) -> ChatResponse:
    return ChatResponse(
        request_id=(
            str(result.request_id)
            if result.request_id is not None
            else None
        ),
        model=result.model,
        backend=result.backend.value,
        content=result.content,
        status=result.status.value,
        latency_ms=result.latency_ms,
        time_to_first_token_ms=result.time_to_first_token_ms,
        finish_reason=result.finish_reason,
        usage=ChatUsageResponse(
            input_tokens=result.usage.input_tokens,
            output_tokens=result.usage.output_tokens,
            total_tokens=result.usage.total_tokens,
            estimated_cost=result.usage.estimated_cost,
        ),
        tool_calls=list(result.tool_calls),
        metadata=dict(result.metadata),
    )

@app.post(
    "/chat",
    response_model=ChatResponse,
)
async def chat(request: ChatRequest) -> ChatResponse:
    service = _get_service()

    if not request.messages:
        raise HTTPException(
            status_code=400,
            detail="At least one message is required.",
        )

    try:
        result = await service.chat(request)
        return _response(result)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {exc}",
        ) from exc


@app.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
) -> StreamingResponse:
    service = _get_service()

    if not request.messages:
        raise HTTPException(
            status_code=400,
            detail="At least one message is required.",
        )

    async def generate() -> AsyncIterator[str]:
        try:
            async for result in service.stream(request):
                payload = _response(result).model_dump()
                yield f"data: {json.dumps(payload)}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as exc:
            payload = {
                "error": str(exc),
            }
            yield f"data: {json.dumps(payload)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


__all__ = ["app"]


