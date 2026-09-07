"""
Health API Router

Provides:
- Liveness check
- Readiness check
- System health status
"""

from fastapi import APIRouter, Depends, status

from src.health.service import HealthService
from src.health.schemas import HealthResponse


router = APIRouter()


def get_health_service() -> HealthService:
    """
    Dependency injection for health service.
    """

    return HealthService()



@router.get(
    "/live",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Application liveness check",
)
async def live_check():
    """
    Kubernetes liveness probe.

    Checks if application is running.
    """

    return {
        "status": "healthy",
        "service": "api",
        "message": "Application is alive",
    }



@router.get(
    "/ready",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Application readiness check",
)
async def ready_check(
    service: HealthService = Depends(
        get_health_service
    ),
):
    """
    Kubernetes readiness probe.

    Checks application dependencies.
    """

    result = await service.check_readiness()

    return result



@router.get(
    "/status",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Complete system health status",
)
async def health_status(
    service: HealthService = Depends(
        get_health_service
    ),
):
    """
    Returns complete health information.

    Checks:
    - Database
    - Redis
    - External services
    """

    result = await service.get_health_status()

    return result 