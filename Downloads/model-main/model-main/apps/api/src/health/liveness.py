"""
Liveness Health Check

Checks whether the API application
is running successfully.

Used by:
- Kubernetes liveness probes
- Load balancers
- Container orchestration systems
"""

from datetime import datetime, timezone
from fastapi import APIRouter, status

from src.health.schemas import HealthResponse


router = APIRouter(
    tags=["Health - Liveness"]
)


@router.get(
    "/live",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Liveness probe",
)
async def liveness_check() -> HealthResponse:
    """
    Application liveness check.

    Returns healthy when the API process
    is alive and responding.
    """

    return HealthResponse(
        status="healthy",
        service="api",
        message="Application is alive",
        timestamp=datetime.now(
            timezone.utc
        ),
    ) 