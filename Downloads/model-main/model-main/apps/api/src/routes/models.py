"""
AI Model API routes.

Provides endpoints for listing available models, retrieving model
details, setting the default model, and checking model health.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.responses.response import ApiResponse
from app.schemas.model import (
    ModelResponse,
    UpdateDefaultModelRequest,
)
from app.services.model import ModelService

router = APIRouter(
    prefix="/models",
    tags=["Models"],
)


def get_model_service() -> ModelService:
    """
    Dependency for ModelService.
    """
    return ModelService()


@router.get(
    "",
    response_model=ApiResponse[list[ModelResponse]],
    summary="List available AI models",
)
async def list_models(
    service: ModelService = Depends(get_model_service),
    current_user=Depends(get_current_user),
) -> ApiResponse[list[ModelResponse]]:
    """
    Return all available AI models.
    """

    models = await service.list_models()

    return ApiResponse.ok(
        data=models,
        message="Models retrieved successfully.",
    )


@router.get(
    "/default",
    response_model=ApiResponse[ModelResponse],
    summary="Get default AI model",
)
async def get_default_model(
    service: ModelService = Depends(get_model_service),
    current_user=Depends(get_current_user),
) -> ApiResponse[ModelResponse]:
    """
    Return the current default AI model.
    """

    model = await service.get_default_model()

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Default model not configured.",
        )

    return ApiResponse.ok(
        data=model,
        message="Default model retrieved successfully.",
    )


@router.get(
    "/{model_id}",
    response_model=ApiResponse[ModelResponse],
    summary="Get AI model",
)
async def get_model(
    model_id: str,
    service: ModelService = Depends(get_model_service),
    current_user=Depends(get_current_user),
) -> ApiResponse[ModelResponse]:
    """
    Return details for a specific AI model.
    """

    model = await service.get_model(model_id)

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found.",
        )

    return ApiResponse.ok(
        data=model,
        message="Model retrieved successfully.",
    )


@router.put(
    "/default",
    response_model=ApiResponse[ModelResponse],
    summary="Set default AI model",
)
async def set_default_model(
    request: UpdateDefaultModelRequest,
    service: ModelService = Depends(get_model_service),
    current_user=Depends(get_current_user),
) -> ApiResponse[ModelResponse]:
    """
    Update the application's default AI model.
    """

    model = await service.set_default_model(
        model_id=request.model_id,
        updated_by=current_user.id,
    )

    return ApiResponse.ok(
        data=model,
        message="Default model updated successfully.",
    )


@router.get(
    "/{model_id}/health",
    response_model=ApiResponse[dict[str, Any]],
    summary="Model health",
)
async def model_health(
    model_id: str,
    service: ModelService = Depends(get_model_service),
    current_user=Depends(get_current_user),
) -> ApiResponse[dict[str, Any]]:
    """
    Check the health of an AI model/provider.
    """

    health = await service.health(model_id)

    return ApiResponse.ok(
        data=health,
        message="Model health retrieved successfully.",
    )


@router.get(
    "/providers",
    response_model=ApiResponse[list[str]],
    summary="List AI providers",
)
async def list_providers(
    service: ModelService = Depends(get_model_service),
    current_user=Depends(get_current_user),
) -> ApiResponse[list[str]]:
    """
    Return supported AI providers.
    """

    providers = await service.list_providers()

    return ApiResponse.ok(
        data=providers,
        message="Providers retrieved successfully.",
    )