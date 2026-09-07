"""
Application Exceptions

Centralized exports for all custom exceptions and exception handlers.
"""

from .api import (
    APIException,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    ConflictException,
    ValidationException,
    InternalServerException,
    ServiceUnavailableException,
)

from .handler import (
    register_exception_handlers,
)

from .handlers import (
    api_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
)

from .validation import (
    ValidationError,
    validate_email,
    validate_uuid,
    validate_required,
)

__all__ = [
    # API Exceptions
    "APIException",
    "BadRequestException",
    "UnauthorizedException",
    "ForbiddenException",
    "NotFoundException",
    "ConflictException",
    "ValidationException",
    "InternalServerException",
    "ServiceUnavailableException",

    # Exception Registration
    "register_exception_handlers",

    # Exception Handlers
    "api_exception_handler",
    "validation_exception_handler",
    "http_exception_handler",
    "unhandled_exception_handler",

    # Validation
    "ValidationError",
    "validate_email",
    "validate_uuid",
    "validate_required",
] 