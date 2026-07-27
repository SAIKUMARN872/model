"""
Response serializer.

Provides helper methods for building standardized API responses.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.responses.response import ApiResponse


class ResponseSerializer:
    """
    Serializer for API responses.
    """

    @staticmethod
    def success(
        *,
        data: Any = None,
        message: str = "Success",
        metadata: dict[str, Any] | None = None,
    ) -> ApiResponse[Any]:
        """
        Build a successful API response.
        """

        return ApiResponse.ok(
            data=data,
            message=message,
            **(metadata or {}),
        )

    @staticmethod
    def error(
        *,
        message: str,
        errors: list[dict[str, Any]] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ApiResponse[Any]:
        """
        Build an error API response.
        """

        return ApiResponse.fail(
            message=message,
            errors=errors or [],
            **(metadata or {}),
        )

    @staticmethod
    def paginated(
        *,
        items: list[Any],
        total: int,
        page: int,
        page_size: int,
        message: str = "Success",
    ) -> ApiResponse[dict[str, Any]]:
        """
        Build a paginated response.
        """

        total_pages = (
            (total + page_size - 1) // page_size
            if page_size > 0
            else 0
        )

        payload = {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_items": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1,
            },
        }

        return ApiResponse.ok(
            data=payload,
            message=message,
        )

    @staticmethod
    def deleted(
        *,
        resource: str = "Resource",
    ) -> ApiResponse[dict[str, Any]]:
        """
        Build a delete response.
        """

        return ApiResponse.ok(
            data={},
            message=f"{resource} deleted successfully.",
        )

    @staticmethod
    def created(
        *,
        data: Any,
        resource: str = "Resource",
    ) -> ApiResponse[Any]:
        """
        Build a create response.
        """

        return ApiResponse.ok(
            data=data,
            message=f"{resource} created successfully.",
        )

    @staticmethod
    def updated(
        *,
        data: Any,
        resource: str = "Resource",
    ) -> ApiResponse[Any]:
        """
        Build an update response.
        """

        return ApiResponse.ok(
            data=data,
            message=f"{resource} updated successfully.",
        )

    @staticmethod
    def health(
        *,
        status: str = "healthy",
        checks: dict[str, Any] | None = None,
    ) -> ApiResponse[dict[str, Any]]:
        """
        Build a health check response.
        """

        return ApiResponse.ok(
            data={
                "status": status,
                "timestamp": datetime.now(
                    timezone.utc,
                ).isoformat(),
                "checks": checks or {},
            },
            message="Health check completed.",
        ) 