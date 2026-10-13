"""Jira read-operation schemas and validation."""

import re
from urllib.parse import quote

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.schemas import validate_connector_arguments
from ai.connectors.jira.models import JiraOperation

_ISSUE_KEY = re.compile(r"^[A-Za-z][A-Za-z0-9_]{0,49}-[0-9]{1,10}$")
_PROJECT_KEY = re.compile(r"^[A-Za-z][A-Za-z0-9_]{0,49}$")


def _object_schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def _page_properties():
    return {
        "start_at": {"type": "integer", "minimum": 0, "maximum": 10000},
        "max_results": {"type": "integer", "minimum": 1, "maximum": 100},
    }


def build_jira_operations():
    issue_key = {"type": "string", "minLength": 3, "maxLength": 61}
    return (
        JiraOperation(
            name="search_issues",
            method="GET",
            path_template="/rest/api/3/search",
            description="Search Jira issues using JQL.",
            schema=_object_schema({
                "jql": {"type": "string", "minLength": 1, "maxLength": 2000},
                **_page_properties(),
                "fields": {
                    "type": "array",
                    "items": {"type": "string"},
                    "maxItems": 50,
                },
            }, ["jql"]),
        ),
        JiraOperation(
            name="get_issue",
            method="GET",
            path_template="/rest/api/3/issue/{issue_key}",
            description="Retrieve an issue by key.",
            schema=_object_schema({
                "issue_key": issue_key,
                "fields": {
                    "type": "array",
                    "items": {"type": "string"},
                    "maxItems": 50,
                },
            }, ["issue_key"]),
        ),
        JiraOperation(
            name="list_projects",
            method="GET",
            path_template="/rest/api/3/project/search",
            description="List projects visible to the authenticated account.",
            schema=_object_schema({
                **_page_properties(),
                "query": {"type": "string", "maxLength": 200},
            }),
        ),
        JiraOperation(
            name="get_issue_comments",
            method="GET",
            path_template="/rest/api/3/issue/{issue_key}/comment",
            description="Retrieve comments for an issue.",
            schema=_object_schema({
                "issue_key": issue_key,
                **_page_properties(),
            }, ["issue_key"]),
        ),
    )


def build_jira_metadata(config):
    operations = build_jira_operations()
    return ConnectorMetadata(
        name="jira",
        version=config.version,
        description=config.description,
        operations=tuple(op.name for op in operations),
        operation_schemas={op.name: op.schema for op in operations},
        required_permissions=config.required_permissions,
    )


def validate_jira_arguments(metadata, operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")
    validate_connector_arguments(metadata, operation, arguments)
    result = dict(arguments)

    if "issue_key" in result:
        value = result["issue_key"]
        if not isinstance(value, str) or not _ISSUE_KEY.fullmatch(value):
            raise ConnectorValidationError("issue_key is invalid")

    if "jql" in result:
        value = result["jql"]
        if (
            not isinstance(value, str)
            or not value.strip()
            or len(value) > 2000
            or any(ord(ch) < 32 and ch not in "\t" for ch in value)
        ):
            raise ConnectorValidationError("jql is invalid")

    if "query" in result:
        value = result["query"]
        if not isinstance(value, str) or len(value) > 200:
            raise ConnectorValidationError("query is invalid")

    for key, minimum, maximum in (
        ("start_at", 0, 10000),
        ("max_results", 1, 100),
    ):
        if key in result:
            value = result[key]
            if (
                isinstance(value, bool)
                or not isinstance(value, int)
                or not minimum <= value <= maximum
            ):
                raise ConnectorValidationError(
                    f"{key} must be an integer from {minimum} to {maximum}"
                )

    if "fields" in result:
        fields = result["fields"]
        if not isinstance(fields, list) or len(fields) > 50:
            raise ConnectorValidationError("fields must be a list of at most 50 names")
        for field in fields:
            if (
                not isinstance(field, str)
                or not field
                or len(field) > 100
                or not re.fullmatch(r"[A-Za-z][A-Za-z0-9_.]*", field)
            ):
                raise ConnectorValidationError("field name is invalid")

    return result


def build_jira_path(operation, arguments):
    path = operation.path_template
    if "{issue_key}" in path:
        path = path.replace(
            "{issue_key}", quote(arguments["issue_key"], safe="")
        )
    return path
