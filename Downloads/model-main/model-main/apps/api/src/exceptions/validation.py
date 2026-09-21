"""
Validation Exception Handling

Contains custom exceptions related to request/data validation.
"""

from typing import Any, Dict, List, Optional


class ValidationException(Exception):
    """
    Base validation exception.

    Used when incoming data fails business validation rules.
    """

    def __init__(
        self,
        message: str = "Validation failed",
        errors: Optional[List[Dict[str, Any]]] = None,
    ):
        self.message = message
        self.errors = errors or []

        super().__init__(self.message)


class RequestValidationException(ValidationException):
    """
    Exception raised for invalid API request payloads.
    """

    def __init__(
        self,
        message: str = "Invalid request data",
        errors: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(
            message=message,
            errors=errors,
        )


class BusinessValidationException(ValidationException):
    """
    Exception raised when business rules are violated.

    Example:
    - Email already exists
    - User cannot perform this action
    - Invalid workflow state
    """

    def __init__(
        self,
        message: str = "Business validation failed",
        errors: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(
            message=message,
            errors=errors,
        )


class ResourceNotFoundException(ValidationException):
    """
    Exception raised when requested resource is missing.
    """

    def __init__(
        self,
        resource: str,
        identifier: Any,
    ):
        message = (
            f"{resource} with identifier '{identifier}' "
            "was not found"
        )

        super().__init__(
            message=message,
            errors=[
                {
                    "resource": resource,
                    "identifier": identifier,
                }
            ],
        )


def format_validation_errors(
    errors: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Convert Pydantic validation errors
    into API-friendly format.
    """

    formatted_errors = []

    for error in errors:
        formatted_errors.append(
            {
                "field": ".".join(
                    str(location)
                    for location in error.get("loc", [])
                ),
                "message": error.get("msg"),
                "type": error.get("type"),
            }
        )

    return formatted_errors 