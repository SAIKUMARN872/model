"""
Readiness Health Check

Checks whether the application is ready
to serve incoming requests.

Used by:
- Kubernetes readiness probes
- Load balancers
- Deployment health monitoring
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status

from src.health.schemas import HealthResponse
from src.health.service import HealthService


router = APIRouter(
    tags=["Health - Readiness"]
)


def get_health_service() -> HealthService:
    """
    Dependency injection for HealthService.
    """

    return HealthService()



@router.get(
    "/ready",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Readiness probe",
)
async def readiness_check(
    service: HealthService = Depends(
        get_health_service
    ),
):
    """
    Checks application dependencies.

    Validates:
    - Database connection
    - Redis connection
    - External providers

    Returns ready only when
    required services are available.
    """

    health_status = await service.check_readiness()


    return HealthResponse(
        status=health_status["status"],
        service="api",
        message=health_status["message"],
        timestamp=datetime.now(
            timezone.utc
        ),
    ) 