"""
Health Checks

Contains system dependency health verification.

Checks:
- Database connectivity
- Redis/cache connectivity
- External services
- Application status
"""

import time
from typing import Any, Dict


async def check_database(
    db_session: Any,
) -> Dict[str, Any]:
    """
    Check database connection health.
    """

    start_time = time.time()

    try:
        await db_session.execute(
            "SELECT 1"
        )

        response_time = (
            time.time() - start_time
        )

        return {
            "service": "database",
            "status": "healthy",
            "response_time_ms": round(
                response_time * 1000,
                2,
            ),
        }

    except Exception as exc:

        return {
            "service": "database",
            "status": "unhealthy",
            "error": str(exc),
        }



async def check_redis(
    redis_client: Any,
) -> Dict[str, Any]:
    """
    Check Redis/cache connectivity.
    """

    start_time = time.time()

    try:
        await redis_client.ping()

        response_time = (
            time.time() - start_time
        )

        return {
            "service": "redis",
            "status": "healthy",
            "response_time_ms": round(
                response_time * 1000,
                2,
            ),
        }

    except Exception as exc:

        return {
            "service": "redis",
            "status": "unhealthy",
            "error": str(exc),
        }



async def check_external_service(
    name: str,
    client: Any,
) -> Dict[str, Any]:
    """
    Generic external service check.

    Example:
    - OpenAI
    - Gemini
    - AWS
    """

    try:

        await client.health_check()

        return {
            "service": name,
            "status": "healthy",
        }

    except Exception as exc:

        return {
            "service": name,
            "status": "unhealthy",
            "error": str(exc),
        }



def application_check() -> Dict[str, Any]:
    """
    Basic application liveness check.
    """

    return {
        "service": "api",
        "status": "healthy",
        "message": "Application is running",
    }  