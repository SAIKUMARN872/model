"""Linear read-only operation schemas and validation."""

import re

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.linear.models import LinearOperation

_ID = re.compile(r"^[A-Za-z0-9_-]{1,100}$")


def _schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def build_linear_operations():
    return (
        LinearOperation(
            name="search_issues",
            description="Search issues by a text query.",
            query=(
                "query SearchIssues($filter: IssueFilter, $first: Int) { "
                "issues(filter: $filter, first: $first) { nodes { "
                "id identifier title description url state { name } "
                "assignee { name } team { key name } } } }"
            ),
            schema=_schema({
                "query": {"type": "string", "minLength": 1, "maxLength": 200},
                "limit": {"type": "integer", "minimum": 1, "maximum": 50},
            }, ["query"]),
        ),
        LinearOperation(
            name="get_issue",
            description="Get an issue by its identifier or UUID.",
            query=(
                "query GetIssue($id: String!) { issue(id: $id) { "
                "id identifier title description url createdAt updatedAt "
                "state { name } assignee { name email } "
                "team { id key name } project { id name } } }"
            ),
            schema=_schema({
                "issue_id": {"type": "string", "minLength": 1, "maxLength": 100},
            }, ["issue_id"]),
        ),
        LinearOperation(
            name="list_projects",
            description="List accessible projects.",
            query=(
                "query ListProjects($first: Int) { projects(first: $first) { "
                "nodes { id name description url state } } }"
            ),
            schema=_schema({
                "limit": {"type": "integer", "minimum": 1, "maximum": 50},
            }),
        ),
        LinearOperation(
            name="list_teams",
            description="List accessible teams.",
            query=(
                "query ListTeams($first: Int) { teams(first: $first) { "
                "nodes { id key name description } } }"
            ),
            schema=_schema({
                "limit": {"type": "integer", "minimum": 1, "maximum": 50},
            }),
        ),
    )


def build_linear_metadata(config):
    operations = build_linear_operations()
    return ConnectorMetadata(
        name="linear",
        version=config.version,
        description=config.description,
        operations=tuple(op.name for op in operations),
        operation_schemas={op.name: op.schema for op in operations},
        required_permissions=config.required_permissions,
    )


def validate_linear_arguments(metadata, operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")

    if operation not in metadata.operation_schemas:
        raise ConnectorValidationError("Unsupported Linear operation")

    schema = metadata.operation_schemas[operation]
    required = schema.get("required", [])
    properties = schema.get("properties", {})

    unknown = set(arguments) - set(properties)
    if unknown:
        raise ConnectorValidationError("Unknown Linear argument")

    for name in required:
        if name not in arguments:
            raise ConnectorValidationError(f"Missing required argument: {name}")

    result = dict(arguments)

    if operation == "search_issues":
        query = result.get("query")
        if (
            not isinstance(query, str)
            or not query.strip()
            or len(query) > 200
            or any(ord(ch) < 32 for ch in query)
        ):
            raise ConnectorValidationError("query must be non-empty text up to 200 characters")

    if operation == "get_issue":
        issue_id = result.get("issue_id")
        if not isinstance(issue_id, str) or not _ID.fullmatch(issue_id):
            raise ConnectorValidationError("issue_id contains invalid characters")

    limit = result.get("limit", 20)
    if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 50:
        raise ConnectorValidationError("limit must be an integer from 1 to 50")

    result["limit"] = limit
    return result


def build_linear_variables(operation, arguments):
    if operation == "search_issues":
        return {
            "filter": {"or": [
                {"title": {"containsIgnoreCase": arguments["query"]}},
                {"description": {"containsIgnoreCase": arguments["query"]}},
            ]},
            "first": arguments["limit"],
        }
    if operation in ("list_projects", "list_teams"):
        return {"first": arguments["limit"]}
    return {"id": arguments["issue_id"]}
