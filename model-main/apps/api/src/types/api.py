"""
API related type definitions.

Contains shared typing contracts used by
API routes, requests, responses, and middleware.
"""

from __future__ import annotations

from typing import Any, Literal, TypeAlias
from uuid import UUID


# -----------------------------
# HTTP Methods
# -----------------------------

HTTPMethod: TypeAlias = Literal[
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]


# -----------------------------
# API Response Types
# -----------------------------

APIStatus: TypeAlias = Literal[
    "success",
    "error",
]


# -----------------------------
# Request Context
# -----------------------------

RequestID: TypeAlias = UUID


UserID: TypeAlias = UUID


OrganizationID: TypeAlias = UUID



# -----------------------------
# Generic Data Types
# -----------------------------

JSONPrimitive: TypeAlias = (
    str
    | int
    | float
    | bool
    | None
)


JSONValue: TypeAlias = (
    JSONPrimitive
    | dict[str, Any]
    | list[Any]
)


JSONDict: TypeAlias = dict[str, JSONValue]



# -----------------------------
# Pagination Types
# -----------------------------

PageNumber: TypeAlias = int


PageSize: TypeAlias = int



# -----------------------------
# Sorting
# -----------------------------

SortOrder: TypeAlias = Literal[
    "asc",
    "desc",
]



# -----------------------------
# Environment
# -----------------------------

Environment: TypeAlias = Literal[
    "development",
    "testing",
    "staging",
    "production",
]



# -----------------------------
# API Metadata
# -----------------------------

class APIContext:
    """
    Runtime API request context.
    """

    def __init__(
        self,
        request_id: RequestID | None = None,
        user_id: UserID | None = None,
        organization_id: OrganizationID | None = None,
    ) -> None:

        self.request_id = request_id

        self.user_id = user_id

        self.organization_id = organization_id


__all__ = [
    "HTTPMethod",
    "APIStatus",
    "RequestID",
    "UserID",
    "OrganizationID",
    "JSONPrimitive",
    "JSONValue",
    "JSONDict",
    "PageNumber",
    "PageSize",
    "SortOrder",
    "Environment",
    "APIContext",
]