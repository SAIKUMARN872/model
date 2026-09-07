"""
Health check API routes.

Provides liveness, readiness, startup, and metrics health endpoints.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends

from app.responses.response import ApiResponse
from app.services.health import HealthService

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


def get_health_service() -> HealthService:
    """
    Health service dependency.
    """
    return HealthService()


@router.get(
    "/live",
    response_model=ApiResponse[dict[str, Any]],
    summary="Liveness probe",
)
async def liveness() -> ApiResponse[dict[str, Any]]:
    """
    Kubernetes/Docker liveness probe.
    """

    return ApiResponse.ok(
        data={
            "status": "alive",
            "timestamp": datetime.now(timezone.utc),
        },
        message="Application is alive.",
    )


@router.get(
    "/ready",
    response_model=ApiResponse[dict[str, Any]],
    summary="Readiness probe",
)
async def readiness(
    service: HealthService = Depends(get_health_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Kubernetes readiness probe.
    """

    checks = await service.readiness()

    return ApiResponse.ok(
        data=checks,
        message="Readiness check completed.",
    )


@router.get(
    "",
    response_model=ApiResponse[dict[str, Any]],
    summary="Application health",
)
async def health(
    service: HealthService = Depends(get_health_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Complete application health check.
    """

    health_status = await service.health()

    return ApiResponse.ok(
        data=health_status,
        message="Health check completed.",
    )


@router.get(
    "/startup",
    response_model=ApiResponse[dict[str, Any]],
    summary="Startup probe",
)
async def startup(
    service: HealthService = Depends(get_health_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Startup probe.
    """

    startup_status = await service.startup()

    return ApiResponse.ok(
        data=startup_status,
        message="Startup check completed.",
    )


@router.get(
    "/dependencies",
    response_model=ApiResponse[dict[str, Any]],
    summary="Dependencies health",
)
async def dependencies(
    service: HealthService = Depends(get_health_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Check external dependencies.
    """

    dependencies_status = await service.dependencies()

    return ApiResponse.ok(
        data=dependencies_status,
        message="Dependency health retrieved successfully.",
    )


@router.get(
    "/metrics",
    response_model=ApiResponse[dict[str, Any]],
    summary="Application metrics",
)
async def metrics(
    service: HealthService = Depends(get_health_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Return application metrics.
    """

    metrics = await service.metrics()

    return ApiResponse.ok(
        data=metrics,
        message="Metrics retrieved successfully.",
    )