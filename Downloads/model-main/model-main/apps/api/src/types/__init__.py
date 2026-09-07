"""
Application type definitions.

Exports reusable type aliases, protocols,
and shared typing utilities.
"""

from .common import (
    JSONDict,
    JSONValue,
    UUIDType,
)

from .pagination import (
    PageNumber,
    PageSize,
    CursorType,
)

from .response import (
    ResponseData,
    ErrorData,
)

from .events import (
    EventPayload,
    EventHandler,
)

from .ai import (
    AIMessage,
    AIResponse,
    ModelName,
    ProviderName,
)


__all__ = [
    # Common types
    "JSONDict",
    "JSONValue",
    "UUIDType",

    # Pagination types
    "PageNumber",
    "PageSize",
    "CursorType",

    # Response types
    "ResponseData",
    "ErrorData",

    # Event types
    "EventPayload",
    "EventHandler",

    # AI types
    "AIMessage",
    "AIResponse",
    "ModelName",
    "ProviderName",
]