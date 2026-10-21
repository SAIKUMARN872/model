"""GitLab operation schemas, metadata, and argument validation."""

import re

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.schemas import validate_connector_arguments
from ai.connectors.gitlab.models import GitLabOperation

_PROJECT_ID = re.compile(r"^[1-9][0-9]{0,17}$")


def _object_schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def build_gitlab_operations():
    return (
        GitLabOperation(
            name="get_current_user",
            path_template="/user",
            description="Get the authenticated GitLab user.",
            schema=_object_schema(),
        ),
        GitLabOperation(
            name="list_projects",
            path_template="/projects",
            description="List projects visible to the authenticated user.",
            schema=_object_schema({
                "membership": {"type": "boolean"},
                "owned": {"type": "boolean"},
                "order_by": {"type": "string", "enum": ["id", "name", "created_at", "updated_at", "last_activity_at"]},
                "sort": {"type": "string", "enum": ["asc", "desc"]},
                "per_page": {"type": "integer", "minimum": 1, "maximum": 100},
                "page": {"type": "integer", "minimum": 1, "maximum": 10000},
            }),
        ),
        GitLabOperation(
            name="get_project",
            path_template="/projects/{project_id}",
            description="Get a project by its numeric GitLab project ID.",
            schema=_object_schema({
                "project_id": {"type": "string", "minLength": 1},
            }, ["project_id"]),
        ),
        GitLabOperation(
            name="list_issues",
            path_template="/projects/{project_id}/issues",
            description="List issues in a project.",
            schema=_object_schema({
                "project_id": {"type": "string", "minLength": 1},
                "state": {"type": "string", "enum": ["opened", "closed", "all"]},
                "per_page": {"type": "integer", "minimum": 1, "maximum": 100},
                "page": {"type": "integer", "minimum": 1, "maximum": 10000},
            }, ["project_id"]),
        ),
    )


def build_gitlab_metadata(config):
    operations = build_gitlab_operations()
    return ConnectorMetadata(
        name="gitlab",
        version=config.version,
        description=config.description,
        operations=tuple(operation.name for operation in operations),
        operation_schemas={
            operation.name: operation.schema for operation in operations
        },
        required_permissions=config.required_permissions,
    )


def validate_gitlab_arguments(metadata, operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")

    normalized = dict(arguments)
    if "project_id" in normalized:
        project_id = normalized["project_id"]
        if isinstance(project_id, int) and not isinstance(project_id, bool):
            normalized["project_id"] = str(project_id)

    validate_connector_arguments(metadata, operation, normalized)
    result = dict(normalized)

    if "project_id" in result:
        project_id = result["project_id"]
        if isinstance(project_id, bool) or not isinstance(project_id, (str, int)):
            raise ConnectorValidationError("project_id must be a numeric GitLab project ID")
        project_id = str(project_id)
        if not _PROJECT_ID.fullmatch(project_id):
            raise ConnectorValidationError("project_id must be a positive numeric GitLab project ID")
        result["project_id"] = project_id

    for key, low, high in (("per_page", 1, 100), ("page", 1, 10000)):
        if key in result:
            value = result[key]
            if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
                raise ConnectorValidationError(
                    f"{key} must be an integer from {low} to {high}"
                )

    for key in ("membership", "owned"):
        if key in result and not isinstance(result[key], bool):
            raise ConnectorValidationError(f"{key} must be a boolean")

    return result

