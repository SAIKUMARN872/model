"""Strict input schemas for the supported read-only Notion operations."""
from __future__ import annotations

from typing import Any

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from .models import is_notion_id

_ID = {
    "type": "string",
    "minLength": 32,
    "maxLength": 36,
}
_PAGE_SIZE = {"type": "integer", "minimum": 1, "maximum": 100}
_CURSOR = {"type": "string", "minLength": 1, "maxLength": 2000}
_QUERY = {"type": "string", "maxLength": 2000}

OPERATIONS: dict[str, dict[str, Any]] = {
    "search_pages": {
        "schema": {
            "type": "object",
            "properties": {
                "query": _QUERY,
                "page_size": _PAGE_SIZE,
                "start_cursor": _CURSOR,
                "sort_direction": {
                    "type": "string",
                    "enum": ["ascending", "descending"],
                },
            },
            "required": [],
            "additionalProperties": False,
        }
    },
    "search_data_sources": {
        "schema": {
            "type": "object",
            "properties": {
                "query": _QUERY,
                "page_size": _PAGE_SIZE,
                "start_cursor": _CURSOR,
                "sort_direction": {
                    "type": "string",
                    "enum": ["ascending", "descending"],
                },
            },
            "required": [],
            "additionalProperties": False,
        }
    },
    "get_page": {
        "schema": {
            "type": "object",
            "properties": {"page_id": _ID},
            "required": ["page_id"],
            "additionalProperties": False,
        }
    },
    "get_data_source": {
        "schema": {
            "type": "object",
            "properties": {"data_source_id": _ID},
            "required": ["data_source_id"],
            "additionalProperties": False,
        }
    },
    "query_data_source": {
        "schema": {
            "type": "object",
            "properties": {
                "data_source_id": _ID,
                "page_size": _PAGE_SIZE,
                "start_cursor": _CURSOR,
                "filter": {"type": "object"},
                "sorts": {"type": "array"},
            },
            "required": ["data_source_id"],
            "additionalProperties": False,
        }
    },
}


def validate_arguments(
    metadata: ConnectorMetadata,
    operation: str,
    arguments: dict[str, Any],
) -> dict[str, Any]:
    if operation not in OPERATIONS:
        raise ConnectorValidationError(
            f"Unsupported Notion operation '{operation}'."
        )
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("Arguments must be an object.")

    schema = OPERATIONS[operation]["schema"]
    allowed = set(schema["properties"])
    unknown = set(arguments) - allowed
    if unknown:
        raise ConnectorValidationError(
            f"Unknown argument(s): {', '.join(sorted(unknown))}."
        )

    for name in schema["required"]:
        if name not in arguments:
            raise ConnectorValidationError(f"Missing required argument '{name}'.")

    for name, value in arguments.items():
        if name in ("page_id", "data_source_id"):
            if not is_notion_id(value):
                raise ConnectorValidationError(
                    f"'{name}' must be a valid Notion UUID."
                )
        elif name == "page_size":
            if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 100:
                raise ConnectorValidationError("'page_size' must be an integer from 1 to 100.")
        elif name == "start_cursor":
            if not isinstance(value, str) or not value or len(value) > 2000:
                raise ConnectorValidationError("'start_cursor' must be a non-empty string up to 2000 characters.")
        elif name == "query":
            if not isinstance(value, str) or len(value) > 2000:
                raise ConnectorValidationError("'query' must be a string up to 2000 characters.")
        elif name == "sort_direction":
            if value not in ("ascending", "descending"):
                raise ConnectorValidationError("'sort_direction' must be ascending or descending.")
        elif name == "filter":
            if not isinstance(value, dict):
                raise ConnectorValidationError("'filter' must be an object.")
        elif name == "sorts":
            if not isinstance(value, list) or any(not isinstance(item, dict) for item in value):
                raise ConnectorValidationError("'sorts' must be a list of objects.")

    return dict(arguments)
