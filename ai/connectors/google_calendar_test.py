import unittest

from ai.connectors.google_calendar import (
    GOOGLE_CALENDAR_API_BASE_URL,
    GoogleCalendarConnector,
    GoogleCalendarConnectorConfig,
    register_google_calendar_connector,
)
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry


class FakeGoogleCalendarClient:
    def __init__(self, response=None, error=None):
        self.response = response if response is not None else {"ok": True}
        self.error = error
        self.calls = []

    def request(self, path, *, access_token, query=None):
        self.calls.append({
            "path": path,
            "access_token": access_token,
            "query": query,
        })
        if self.error:
            raise self.error
        return self.response


class GoogleCalendarConnectorTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.config = GoogleCalendarConnectorConfig()
        self.client = FakeGoogleCalendarClient()
        self.connector = GoogleCalendarConnector(self.config, self.client)
        self.credentials = {"access_token": "fake-calendar-access-token"}

    async def test_list_calendars(self):
        result = await self.connector.execute(
            ConnectorRequest("list_calendars", {"maxResults": 10}),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0]["path"], "/users/me/calendarList")
        self.assertEqual(self.client.calls[0]["query"], {"maxResults": 10})

    async def test_list_events(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "list_events",
                {
                    "calendar_id": "primary",
                    "maxResults": 20,
                    "singleEvents": True,
                    "orderBy": "startTime",
                    "timeMin": "2026-10-12T00:00:00Z",
                    "timeMax": "2026-10-13T00:00:00Z",
                },
            ),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["path"], "/calendars/primary/events"
        )
        self.assertEqual(self.client.calls[0]["query"]["maxResults"], 20)

    async def test_get_event(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "get_event",
                {"calendar_id": "primary", "event_id": "event_123"},
            ),
            self.credentials,
        )
        self.assertTrue(result.success)
        self.assertEqual(
            self.client.calls[0]["path"],
            "/calendars/primary/events/event_123",
        )

    async def test_missing_token_fails_without_request(self):
        result = await self.connector.execute(
            ConnectorRequest("list_calendars", {}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation_is_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("delete_event", {"event_id": "abc"}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_calendar_path_traversal(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "list_events", {"calendar_id": "../other"}
            ),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_event_id(self):
        result = await self.connector.execute(
            ConnectorRequest(
                "get_event",
                {"calendar_id": "primary", "event_id": "../other"},
            ),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_max_results(self):
        result = await self.connector.execute(
            ConnectorRequest("list_calendars", {"maxResults": 999}),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_boolean(self):
        result = await self.connector.execute(
            ConnectorRequest("list_events", {
                "calendar_id": "primary", "singleEvents": "true"
            }),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_rejects_invalid_time_range(self):
        result = await self.connector.execute(
            ConnectorRequest("list_events", {
                "calendar_id": "primary",
                "timeMin": "2026-10-14T00:00:00Z",
                "timeMax": "2026-10-13T00:00:00Z",
            }),
            self.credentials,
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_transport_error_does_not_leak_token(self):
        client = FakeGoogleCalendarClient(
            error=RuntimeError("fake-calendar-access-token")
        )
        connector = GoogleCalendarConnector(self.config, client)
        result = await connector.execute(
            ConnectorRequest("list_calendars", {}), self.credentials
        )
        self.assertFalse(result.success)
        self.assertNotIn("fake-calendar-access-token", result.error)

    async def test_registration_helper(self):
        registry = ConnectorRegistry()
        connector = register_google_calendar_connector(
            registry, self.config, self.client
        )
        self.assertIs(registry.get("google_calendar"), connector)

    async def test_api_host_is_fixed(self):
        self.assertEqual(
            self.config.transport.base_url, GOOGLE_CALENDAR_API_BASE_URL
        )
        self.assertEqual(
            tuple(self.config.transport.allowed_hosts), ("www.googleapis.com",)
        )


if __name__ == "__main__":
    unittest.main()
