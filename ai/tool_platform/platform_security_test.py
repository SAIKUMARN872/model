import unittest

from ai.tool_platform.validation.validator import (
    ToolInputValidationError,
    validate_arguments,
)
from ai.tool_platform.permissions.policy import (
    PermissionContext,
    ToolPermissionError,
    authorize_tool,
)


class ArgumentValidationTests(unittest.TestCase):
    def setUp(self):
        self.schema = {
            "type": "object",
            "properties": {
                "query": {"type": "string", "minLength": 2},
                "limit": {"type": "integer", "minimum": 1, "maximum": 10},
            },
            "required": ["query"],
            "additionalProperties": False,
        }

    def test_valid_arguments(self):
        args = {"query": "weather", "limit": 5}
        self.assertEqual(validate_arguments(args, self.schema), args)

    def test_rejects_non_dictionary(self):
        with self.assertRaises(ToolInputValidationError):
            validate_arguments(["weather"], self.schema)

    def test_rejects_missing_required(self):
        with self.assertRaises(ToolInputValidationError):
            validate_arguments({"limit": 3}, self.schema)

    def test_rejects_wrong_type(self):
        with self.assertRaises(ToolInputValidationError):
            validate_arguments({"query": 123}, self.schema)

    def test_rejects_unknown_argument(self):
        with self.assertRaises(ToolInputValidationError):
            validate_arguments(
                {"query": "weather", "unknown": True}, self.schema
            )

    def test_rejects_out_of_range(self):
        with self.assertRaises(ToolInputValidationError):
            validate_arguments({"query": "weather", "limit": 11}, self.schema)


class PermissionTests(unittest.TestCase):
    def test_allows_required_permissions(self):
        context = PermissionContext(
            user_id="user-1",
            permissions=frozenset({"weather:read", "profile:read"}),
        )
        self.assertIsNone(authorize_tool(("weather:read",), context))

    def test_rejects_missing_permission(self):
        context = PermissionContext(
            user_id="user-1",
            permissions=frozenset({"profile:read"}),
        )
        with self.assertRaises(ToolPermissionError):
            authorize_tool(("weather:read",), context)

    def test_rejects_missing_context(self):
        with self.assertRaises(ToolPermissionError):
            authorize_tool(("weather:read",), None)

    def test_tools_without_requirements_need_no_context(self):
        self.assertIsNone(authorize_tool((), None))

    def test_rejects_invalid_context(self):
        with self.assertRaises((ValueError, TypeError)):
            PermissionContext(user_id="", permissions=frozenset())


if __name__ == "__main__":
    unittest.main()
