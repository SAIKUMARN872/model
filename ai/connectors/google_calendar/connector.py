"""Read-only Google Calendar connector."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.google_calendar.schemas import (
    build_google_calendar_metadata,
    build_google_calendar_operations,
    validate_google_calendar_arguments,
)


class GoogleCalendarConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {
            item.name: item for item in build_google_calendar_operations()
        }
        super().__init__(build_google_calendar_metadata(config))

    async def execute(self, request, credentials):
        operation_name = request.operation
        try:
            self.validate_operation(operation_name)
            arguments = validate_google_calendar_arguments(
                self.metadata, operation_name, dict(request.arguments or {})
            )

            access_token = credentials.get("access_token")
            if not isinstance(access_token, str) or not access_token.strip():
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=operation_name,
                    success=False,
                    error="Google Calendar OAuth access token is not configured",
                )

            operation = self._operations[operation_name]
            path = operation.path_template

            if operation_name == "list_events":
                calendar_id = arguments["calendar_id"]
                path = path.replace("{calendar_id}", calendar_id)
            elif operation_name == "get_event":
                path = path.replace("{calendar_id}", arguments["calendar_id"])
                path = path.replace("{event_id}", arguments["event_id"])

            query_keys = (
                "maxResults", "pageToken", "showHidden", "timeMin",
                "timeMax", "singleEvents", "orderBy"
            )
            query = {key: arguments[key] for key in query_keys if key in arguments}

            data = self.client.request(
                path, access_token=access_token, query=query or None
            )
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation_name,
                success=True,
                data=data,
            )
        except (ConnectorError, ConnectorValidationError) as exc:
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation_name,
                success=False,
                error=str(exc),
            )
        except Exception:
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation_name,
                success=False,
                error="Google Calendar request failed",
            )
