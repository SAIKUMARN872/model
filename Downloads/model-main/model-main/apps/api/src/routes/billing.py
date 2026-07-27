"""
Billing API routes.

Provides endpoints for billing, subscriptions, invoices,
payment methods, and usage information.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.responses.response import ApiResponse
from app.schemas.billing import (
    BillingPortalResponse,
    PaymentMethodRequest,
    SubscriptionRequest,
)
from app.services.billing import BillingService

router = APIRouter(
    prefix="/billing",
    tags=["Billing"],
)


def get_billing_service() -> BillingService:
    """
    Billing service dependency.
    """
    return BillingService()


@router.get(
    "/subscription",
    response_model=ApiResponse[dict[str, Any]],
    summary="Get current subscription",
)
async def get_subscription(
    current_user=Depends(get_current_user),
    service: BillingService = Depends(get_billing_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Return the authenticated user's subscription.
    """

    subscription = await service.get_subscription(current_user.id)

    return ApiResponse.ok(
        data=subscription,
        message="Subscription retrieved successfully.",
    )


@router.post(
    "/subscription",
    response_model=ApiResponse[dict[str, Any]],
    summary="Create or update subscription",
)
async def update_subscription(
    request: SubscriptionRequest,
    current_user=Depends(get_current_user),
    service: BillingService = Depends(get_billing_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Create or update a subscription.
    """

    subscription = await service.update_subscription(
        user_id=current_user.id,
        request=request,
    )

    return ApiResponse.ok(
        data=subscription,
        message="Subscription updated successfully.",
    )


@router.delete(
    "/subscription",
    response_model=ApiResponse[dict],
    summary="Cancel subscription",
)
async def cancel_subscription(
    current_user=Depends(get_current_user),
    service: BillingService = Depends(get_billing_service),
) -> ApiResponse[dict]:
    """
    Cancel the current subscription.
    """

    await service.cancel_subscription(current_user.id)

    return ApiResponse.ok(
        data={},
        message="Subscription cancelled successfully.",
    )


@router.get(
    "/invoices",
    response_model=ApiResponse[list[dict[str, Any]]],
    summary="List invoices",
)
async def list_invoices(
    current_user=Depends(get_current_user),
    service: BillingService = Depends(get_billing_service),
) -> ApiResponse[list[dict[str, Any]]]:
    """
    Return all invoices for the authenticated user.
    """

    invoices = await service.list_invoices(current_user.id)

    return ApiResponse.ok(
        data=invoices,
        message="Invoices retrieved successfully.",
    )


@router.post(
    "/payment-method",
    response_model=ApiResponse[dict[str, Any]],
    summary="Add payment method",
)
async def add_payment_method(
    request: PaymentMethodRequest,
    current_user=Depends(get_current_user),
    service: BillingService = Depends(get_billing_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Add or update the user's payment method.
    """

    payment_method = await service.add_payment_method(
        user_id=current_user.id,
        request=request,
    )

    return ApiResponse.ok(
        data=payment_method,
        message="Payment method saved successfully.",
    )


@router.get(
    "/usage",
    response_model=ApiResponse[dict[str, Any]],
    summary="Get billing usage",
)
async def get_usage(
    current_user=Depends(get_current_user),
    service: BillingService = Depends(get_billing_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Return current usage statistics.
    """

    usage = await service.get_usage(current_user.id)

    return ApiResponse.ok(
        data=usage,
        message="Usage retrieved successfully.",
    )


@router.get(
    "/portal",
    response_model=ApiResponse[BillingPortalResponse],
    summary="Billing portal",
)
async def billing_portal(
    current_user=Depends(get_current_user),
    service: BillingService = Depends(get_billing_service),
) -> ApiResponse[BillingPortalResponse]:
    """
    Generate a customer billing portal session.
    """

    portal = await service.create_billing_portal(current_user.id)

    if portal is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create billing portal.",
        )

    return ApiResponse.ok(
        data=portal,
        message="Billing portal created successfully.",
    )