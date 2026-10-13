"""Slack argument validation."""
import re

from ai.connectors.exceptions import ConnectorValidationError

_CHANNEL_ID = re.compile(r"^[A-Z0-9]{2,30}$")
_CURSOR = re.compile(r"^[A-Za-z0-9+/=_\-\.]{1,2000}$")
_TS = re.compile(r"^\d{1,12}(?:\.\d{1,9})?$")


def validate_slack_arguments(operation, arguments, config):
    allowed = {
        "get_workspace_info": set(),
        "list_channels": {"limit", "cursor", "types"},
        "get_channel_history": {"channel", "limit", "cursor", "oldest", "latest"},
        "search_messages": {"query", "count", "page", "sort", "sort_dir"},
    }
    if operation not in allowed:
        raise ConnectorValidationError("Slack operation is not allowlisted.")
    if not isinstance(arguments, dict) or set(arguments) - allowed[operation]:
        raise ConnectorValidationError("Invalid Slack arguments.")

    result = dict(arguments)
    for key in ("limit", "count"):
        if key in result:
            value = result[key]
            if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= config.max_page_size:
                raise ConnectorValidationError(f"Invalid Slack {key}.")
    if "page" in result:
        if isinstance(result["page"], bool) or not isinstance(result["page"], int) or not 1 <= result["page"] <= 100:
            raise ConnectorValidationError("Invalid Slack page.")
    if "channel" in result and (
        not isinstance(result["channel"], str) or not _CHANNEL_ID.fullmatch(result["channel"])
    ):
        raise ConnectorValidationError("Invalid Slack channel ID.")
    if "cursor" in result and (
        not isinstance(result["cursor"], str) or not _CURSOR.fullmatch(result["cursor"])
    ):
        raise ConnectorValidationError("Invalid Slack cursor.")
    for key in ("oldest", "latest"):
        if key in result and (
            not isinstance(result[key], str) or not _TS.fullmatch(result[key])
        ):
            raise ConnectorValidationError(f"Invalid Slack {key} timestamp.")
    if "oldest" in result and "latest" in result and float(result["oldest"]) >= float(result["latest"]):
        raise ConnectorValidationError("Slack oldest must be earlier than latest.")
    if "query" in result and (
        not isinstance(result["query"], str) or not result["query"].strip() or len(result["query"]) > 500
        or any(ord(char) < 32 for char in result["query"])
    ):
        raise ConnectorValidationError("Invalid Slack search query.")
    if "types" in result:
        valid_types = {"public_channel", "private_channel", "mpim", "im"}
        values = result["types"].split(",") if isinstance(result["types"], str) else []
        if not values or any(value not in valid_types for value in values):
            raise ConnectorValidationError("Invalid Slack channel types.")
    if "sort" in result and result["sort"] not in {"timestamp", "score"}:
        raise ConnectorValidationError("Invalid Slack sort.")
    if "sort_dir" in result and result["sort_dir"] not in {"asc", "desc"}:
        raise ConnectorValidationError("Invalid Slack sort direction.")
    return result
