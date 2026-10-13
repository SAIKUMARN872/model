from __future__ import annotations

import unittest

from ai.agents import AgentRequest, AgentResponse, AgentStatus
from ai.agents.execution.utils import (
    validate_agent_request,
    validate_agent_response,
    validate_max_concurrency,
    validate_timeout_seconds,
)


class ExecutionUtilityTests(unittest.TestCase):
    def test_valid_timeout(self) -> None:
        self.assertEqual(validate_timeout_seconds(5), 5.0)
        self.assertEqual(validate_timeout_seconds(0.5), 0.5)

    def test_rejects_invalid_timeout(self) -> None:
        for value in (0, -1, True, float("inf"), float("nan"), "5"):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    validate_timeout_seconds(value)

    def test_valid_concurrency(self) -> None:
        self.assertEqual(validate_max_concurrency(1), 1)
        self.assertEqual(validate_max_concurrency(4), 4)

    def test_rejects_invalid_concurrency(self) -> None:
        for value in (0, -1, True, 1.5, "4"):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    validate_max_concurrency(value)

    def test_valid_request(self) -> None:
        request = AgentRequest(input="hello")
        self.assertIs(validate_agent_request(request), request)

    def test_rejects_invalid_request(self) -> None:
        with self.assertRaises(TypeError):
            validate_agent_request("hello")

    def test_valid_response(self) -> None:
        response = AgentResponse(
            agent_id="test-agent",
            output="hello",
            status=AgentStatus.COMPLETED,
        )
        self.assertIs(validate_agent_response(response), response)

    def test_rejects_invalid_response(self) -> None:
        with self.assertRaises(TypeError):
            validate_agent_response({"output": "hello"})


if __name__ == "__main__":
    unittest.main()
