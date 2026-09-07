"""
API response utilities.

Provides helper functions to create
consistent API responses across the application.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any



def success_response(
    *,
    data: Any = None,
    message: str = "Request completed successfully.",
    status_code: int = 200,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Create successful API response.
    """

    return {
        "success": True,
        "status_code": status_code,
        "message": message,
        "data": data,
        "metadata": metadata or {},
        "timestamp": datetime.now(
            timezone.utc,
        ).isoformat(),
    }



def error_response(
    *,
    message: str = "An error occurred.",
    error_code: str | None = None,
    errors: list[Any] | None = None,
    status_code: int = 400,
) -> dict[str, Any]:
    """
    Create error API response.
    """

    return {
        "success": False,
        "status_code": status_code,
        "message": message,
        "error_code": error_code,
        "errors": errors or [],
        "timestamp": datetime.now(
            timezone.utc,
        ).isoformat(),
    }



def paginated_response(
    *,
    items: list[Any],
    page: int,
    page_size: int,
    total_items: int,
    message: str = "Data retrieved successfully.",
) -> dict[str, Any]:
    """
    Create paginated response.
    """

    total_pages = (
        (total_items + page_size - 1)
        // page_size
        if page_size > 0
        else 0
    )


    return {
        "success": True,
        "message": message,
        "data": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        },
        "timestamp": datetime.now(
            timezone.utc,
        ).isoformat(),
    }



def created_response(
    *,
    data: Any,
    message: str = "Resource created successfully.",
) -> dict[str, Any]:
    """
    Response for created resources.
    """

    return success_response(
        data=data,
        message=message,
        status_code=201,
    )



def updated_response(
    *,
    data: Any,
    message: str = "Resource updated successfully.",
) -> dict[str, Any]:
    """
    Response for updated resources.
    """

    return success_response(
        data=data,
        message=message,
        status_code=200,
    )



def deleted_response(
    *,
    message: str = "Resource deleted successfully.",
) -> dict[str, Any]:
    """
    Response for deleted resources.
    """

    return success_response(
        data=None,
        message=message,
        status_code=204,
    )