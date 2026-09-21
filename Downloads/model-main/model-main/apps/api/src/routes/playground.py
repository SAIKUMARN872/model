"""
AI Playground API routes.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.responses.response import ApiResponse
from app.schemas.playground import (
    PlaygroundChatRequest,
    PlaygroundChatResponse,
)
from app.services.playground import PlaygroundService

router = APIRouter(
    prefix="/playground",
    tags=["Playground"],
)


def get_playground_service() -> PlaygroundService:
    return PlaygroundService()


@router.post(
    "/chat",
    response_model=ApiResponse[PlaygroundChatResponse],
    summary="Playground Chat",
)
async def playground_chat(
    request: PlaygroundChatRequest,
    current_user=Depends(get_current_user),
    service: PlaygroundService = Depends(get_playground_service),
):
    response = await service.chat(
        user=current_user,
        request=request,
    )

    return ApiResponse.ok(
        data=response,
        message="Response generated successfully.",
    )


@router.get(
    "/models",
    response_model=ApiResponse[list[str]],
    summary="Available playground models",
)
async def available_models(
    current_user=Depends(get_current_user),
    service: PlaygroundService = Depends(get_playground_service),
):
    models = await service.available_models()

    return ApiResponse.ok(
        data=models,
        message="Models retrieved successfully.",
    )


@router.get(
    "/providers",
    response_model=ApiResponse[list[str]],
    summary="Available providers",
)
async def available_providers(
    current_user=Depends(get_current_user),
    service: PlaygroundService = Depends(get_playground_service),
):
    providers = await service.available_providers()

    return ApiResponse.ok(
        data=providers,
        message="Providers retrieved successfully.",
    )


@router.post(
    "/clear",
    response_model=ApiResponse[dict],
    summary="Clear playground session",
)
async def clear_session(
    current_user=Depends(get_current_user),
    service: PlaygroundService = Depends(get_playground_service),
):
    await service.clear_session(current_user.id)

    return ApiResponse.ok(
        data={},
        message="Playground session cleared successfully.",
    )


@router.get(
    "/history",
    response_model=ApiResponse[list[PlaygroundChatResponse]],
    summary="Playground history",
)
async def history(
    current_user=Depends(get_current_user),
    service: PlaygroundService = Depends(get_playground_service),
):
    history = await service.history(current_user.id)

    return ApiResponse.ok(
        data=history,
        message="History retrieved successfully.",
    ) 