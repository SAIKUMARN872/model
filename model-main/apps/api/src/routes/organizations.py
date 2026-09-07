"""
Organization API routes.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.responses.response import ApiResponse
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.services.organization import OrganizationService

router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)


def get_organization_service() -> OrganizationService:
    return OrganizationService()


@router.get(
    "",
    response_model=ApiResponse[list[OrganizationResponse]],
    summary="List organizations",
)
async def list_organizations(
    current_user=Depends(get_current_user),
    service: OrganizationService = Depends(get_organization_service),
):
    organizations = await service.list_organizations(current_user.id)

    return ApiResponse.ok(
        data=organizations,
        message="Organizations retrieved successfully.",
    )


@router.post(
    "",
    response_model=ApiResponse[OrganizationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create organization",
)
async def create_organization(
    request: OrganizationCreate,
    current_user=Depends(get_current_user),
    service: OrganizationService = Depends(get_organization_service),
):
    organization = await service.create(
        owner_id=current_user.id,
        request=request,
    )

    return ApiResponse.ok(
        data=organization,
        message="Organization created successfully.",
    )


@router.get(
    "/{organization_id}",
    response_model=ApiResponse[OrganizationResponse],
    summary="Get organization",
)
async def get_organization(
    organization_id: str,
    current_user=Depends(get_current_user),
    service: OrganizationService = Depends(get_organization_service),
):
    organization = await service.get(
        organization_id,
        current_user.id,
    )

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found.",
        )

    return ApiResponse.ok(
        data=organization,
        message="Organization retrieved successfully.",
    )


@router.put(
    "/{organization_id}",
    response_model=ApiResponse[OrganizationResponse],
)
async def update_organization(
    organization_id: str,
    request: OrganizationUpdate,
    current_user=Depends(get_current_user),
    service: OrganizationService = Depends(get_organization_service),
):
    organization = await service.update(
        organization_id,
        current_user.id,
        request,
    )

    return ApiResponse.ok(
        data=organization,
        message="Organization updated successfully.",
    )


@router.delete(
    "/{organization_id}",
    response_model=ApiResponse[dict],
)
async def delete_organization(
    organization_id: str,
    current_user=Depends(get_current_user),
    service: OrganizationService = Depends(get_organization_service),
):
    await service.delete(
        organization_id,
        current_user.id,
    )

    return ApiResponse.ok(
        data={},
        message="Organization deleted successfully.",
    ) 