"""
Common type definitions.

Shared reusable typing aliases used across
the application.
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any, TypeAlias
from uuid import UUID


# -----------------------------
# Primitive Types
# -----------------------------

PrimitiveType: TypeAlias = (
    str
    | int
    | float
    | bool
    | None
)


# -----------------------------
# JSON Types
# -----------------------------

JSONValue: TypeAlias = (
    PrimitiveType
    | dict[str, Any]
    | list[Any]
)


JSONDict: TypeAlias = dict[str, JSONValue]


JSONArray: TypeAlias = list[JSONValue]



# -----------------------------
# Identifier Types
# -----------------------------

UUIDType: TypeAlias = UUID


IDType: TypeAlias = (
    UUID
    | str
    | int
)



# -----------------------------
# Date / Time Types
# -----------------------------

DateType: TypeAlias = date


DateTimeType: TypeAlias = datetime



# -----------------------------
# Numeric Types
# -----------------------------

NumberType: TypeAlias = (
    int
    | float
    | Decimal
)



# -----------------------------
# Generic Data Types
# -----------------------------

DictType: TypeAlias = dict[str, Any]


ListType: TypeAlias = list[Any]



# -----------------------------
# Optional Types
# -----------------------------

NullableString: TypeAlias = str | None


NullableInt: TypeAlias = int | None


NullableBool: TypeAlias = bool | None



# -----------------------------
# File Types
# -----------------------------

FileSize: TypeAlias = int


MimeType: TypeAlias = str



__all__ = [
    # Primitive
    "PrimitiveType",

    # JSON
    "JSONValue",
    "JSONDict",
    "JSONArray",

    # IDs
    "UUIDType",
    "IDType",

    # Date Time
    "DateType",
    "DateTimeType",

    # Numbers
    "NumberType",

    # Generic
    "DictType",
    "ListType",

    # Nullable
    "NullableString",
    "NullableInt",
    "NullableBool",

    # Files
    "FileSize",
    "MimeType",
]