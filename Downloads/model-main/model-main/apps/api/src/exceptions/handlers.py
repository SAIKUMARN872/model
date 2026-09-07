"""
Global Exception Handlers

Production-level FastAPI exception handling layer.

Responsibilities:
- Handle custom application exceptions
- Handle request validation errors
- Handle authentication/authorization errors
- Handle database exceptions
- Return standardized API responses
"""

import logging
from typing import Any, Dict

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException

from src.exceptions.api import (
    AppException,
)


logger = logging.getLogger(__name__)


# =====================================================
# Standard Error Response Builder
# =====================================================

def error_response(
    *,
    status_code: int,
    message: str,
    path: str,
    details: Any = None,
    error_code: str | None = None,
) -> JSONResponse:
    """
    Creates a consistent API error response.
    """

    response: Dict[str, Any] = {
        "success": False,
        "error": {
            "message": message,
            "code": error_code,
        },
        "path": path,
    }

    if details:
        response["error"]["details"] = details

    return JSONResponse(
        status_code=status_code,
        content=response,
    )


# =====================================================
# Custom Application Exception
# =====================================================

async def app_exception_handler(
    request: Request,
    exc: AppException,
):
    """
    Handles business/application errors.
    """

    logger.warning(
        "Application error | %s | %s",
        exc.message,
        request.url.path,
    )

    return error_response(
        status_code=exc.status_code,
        message=exc.message,
        error_code=exc.code,
        path=request.url.path,
    )


# =====================================================
# FastAPI HTTP Exception
# =====================================================

async def http_exception_handler(
    request: Request,
    exc: HTTPException,
):
    """
    Handles HTTP errors like 404, 401, 403.
    """

    return error_response(
        status_code=exc.status_code,
        message=str(exc.detail),
        path=request.url.path,
        error_code="HTTP_ERROR",
    )


# =====================================================
# Pydantic Validation Errors
# =====================================================

async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    """
    Handles invalid request payloads.
    """

    logger.warning(
        "Validation failed | %s",
        request.url.path,
    )

    return error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Validation error",
        details=exc.errors(),
        error_code="VALIDATION_ERROR",
        path=request.url.path,
    )


# =====================================================
# Database Errors
# =====================================================

async def database_exception_handler(
    request: Request,
    exc: SQLAlchemyError,
):
    """
    Handles database failures.
    """

    logger.exception(
        "Database exception occurred",
    )

    return error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Database operation failed",
        error_code="DATABASE_ERROR",
        path=request.url.path,
    )


# =====================================================
# Global Exception Handler
# =====================================================

async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    """
    Catch-all handler for unexpected errors.
    """

    logger.exception(
        "Unhandled exception: %s",
        str(exc),
    )

    return error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Internal server error",
        error_code="INTERNAL_SERVER_ERROR",
        path=request.url.path,
    )


# =====================================================
# Exception Registration
# =====================================================

def register_exception_handlers(app):
    """
    Register all application exception handlers.
    """

    app.add_exception_handler(
        AppException,
        app_exception_handler,
    )

    app.add_exception_handler(
        HTTPException,
        http_exception_handler,
    )

    app.add_exception_handler(
        RequestValidationError,
        validation_exception_handler,
    )

    app.add_exception_handler(
        SQLAlchemyError,
        database_exception_handler,
    )

    app.add_exception_handler(
        Exception,
        global_exception_handler,
    )