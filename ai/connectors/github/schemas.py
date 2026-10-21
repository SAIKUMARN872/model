"""GitHub operation schemas, validation, and metadata."""

import re
from urllib.parse import quote

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.schemas import validate_connector_arguments
from ai.connectors.github.models import GitHubOperation

_REPOSITORY_PART = re.compile(r"^[A-Za-z0-9_.-]{1,100}$")


def _object_schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def build_github_operations():
    return (
        GitHubOperation(
            name="get_authenticated_user",
            path_template="/user",
            description="Get the user associated with the token.",
            schema=_object_schema(),
        ),
        GitHubOperation(
            name="list_repositories",
            path_template="/user/repos",
            description="List repositories accessible to the authenticated user.",
            schema=_object_schema({
                "type": {"type": "string", "enum": ["all", "owner", "member"]},
                "sort": {"type": "string", "enum": ["created", "updated", "pushed", "full_name"]},
                "per_page": {"type": "integer", "minimum": 1, "maximum": 100},
                "page": {"type": "integer", "minimum": 1, "maximum": 10000},
            }),
        ),
        GitHubOperation(
            name="get_repository",
            path_template="/repos/{owner}/{repo}",
            description="Get repository details.",
            schema=_object_schema({
                "owner": {"type": "string", "minLength": 1, "maxLength": 100},
                "repo": {"type": "string", "minLength": 1, "maxLength": 100},
            }, ["owner", "repo"]),
        ),
        GitHubOperation(
            name="list_issues",
            path_template="/repos/{owner}/{repo}/issues",
            description="List issues and pull requests for a repository.",
            schema=_object_schema({
                "owner": {"type": "string", "minLength": 1, "maxLength": 100},
                "repo": {"type": "string", "minLength": 1, "maxLength": 100},
                "state": {"type": "string", "enum": ["open", "closed", "all"]},
                "per_page": {"type": "integer", "minimum": 1, "maximum": 100},
                "page": {"type": "integer", "minimum": 1, "maximum": 10000},
            }, ["owner", "repo"]),
        ),
        GitHubOperation(
            name="get_file_contents",
            path_template="/repos/{owner}/{repo}/contents/{path}",
            description="Get file or directory contents from a repository.",
            schema=_object_schema({
                "owner": {"type": "string", "minLength": 1, "maxLength": 100},
                "repo": {"type": "string", "minLength": 1, "maxLength": 100},
                "path": {"type": "string", "minLength": 1, "maxLength": 2000},
                "ref": {"type": "string", "maxLength": 250},
            }, ["owner", "repo", "path"]),
        ),
    )


def build_github_metadata(config):
    operations = build_github_operations()
    return ConnectorMetadata(
        name="github",
        version=config.version,
        description=config.description,
        operations=tuple(op.name for op in operations),
        operation_schemas={op.name: op.schema for op in operations},
        required_permissions=config.required_permissions,
    )


def _validate_repo_part(value, field):
    if not isinstance(value, str) or not _REPOSITORY_PART.fullmatch(value):
        raise ConnectorValidationError(f"{field} is not a valid repository identifier")
    if value in {".", ".."}:
        raise ConnectorValidationError(f"{field} is not a valid repository identifier")
    return value


def validate_github_arguments(metadata, operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")

    validate_connector_arguments(metadata, operation, arguments)
    result = dict(arguments)

    for key in ("owner", "repo"):
        if key in result:
            result[key] = _validate_repo_part(result[key], key)

    if "path" in result:
        value = result["path"]
        if (
            not isinstance(value, str)
            or not value
            or len(value) > 2000
            or "\x00" in value
            or value.startswith("/")
            or "\\" in value
        ):
            raise ConnectorValidationError("path must be a valid repository-relative path")
        segments = value.split("/")
        if any(segment in {"", ".", ".."} for segment in segments):
            raise ConnectorValidationError("path contains an invalid segment")

    if "ref" in result:
        ref = result["ref"]
        if not isinstance(ref, str) or not ref.strip() or len(ref) > 250:
            raise ConnectorValidationError("ref must be a non-empty Git reference")

    for key, low, high in (("per_page", 1, 100), ("page", 1, 10000)):
        if key in result:
            value = result[key]
            if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
                raise ConnectorValidationError(f"{key} must be an integer from {low} to {high}")

    return result


def build_github_path(operation, arguments):
    """Build a URL path only from validated arguments and fixed templates."""
    template = operation.path_template
    path = template
    for key in ("owner", "repo"):
        marker = "{" + key + "}"
        if marker in path:
            path = path.replace(marker, quote(arguments[key], safe=""))
    if "{path}" in path:
        encoded_path = "/".join(
            quote(segment, safe="") for segment in arguments["path"].split("/")
        )
        path = path.replace("{path}", encoded_path)
    return path
