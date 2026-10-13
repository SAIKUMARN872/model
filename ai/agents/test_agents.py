from __future__ import annotations

import asyncio
import unittest

from ai.agents import (
    AgentContext,
    AgentRequest,
    AgentResponse,
    AgentStatus,
    BaseAgent,
)
from ai.agents.exceptions import AgentValidationError


class EchoAgent(BaseAgent):
    async def execute(self, request: AgentRequest, context: AgentContext) -> str:
        return request.input


class FailingAgent(BaseAgent):
    async def execute(self, request: AgentRequest, context: AgentContext) -> str:
        raise RuntimeError("intentional test failure")


class AgentFoundationTests(unittest.TestCase):
    def test_agent_executes_successfully(self) -> None:
        async def scenario() -> None:
            response = await EchoAgent("echo").run(
                AgentRequest(input="hello")
            )
            self.assertEqual(response.output, "hello")
            self.assertEqual(response.status, AgentStatus.COMPLETED)

        asyncio.run(scenario())

    def test_agent_failure_is_reported(self) -> None:
        async def scenario() -> None:
            response = await FailingAgent("failure").run(
                AgentRequest(input="hello")
            )
            self.assertEqual(response.status, AgentStatus.FAILED)
            self.assertTrue(response.error)

        asyncio.run(scenario())

    def test_context_defaults_are_independent(self) -> None:
        first = AgentContext()
        second = AgentContext()
        self.assertIsNot(first.metadata, second.metadata)

    def test_failed_agent_can_be_reset(self) -> None:
        async def scenario() -> None:
            agent = FailingAgent("failure")
            await agent.run(AgentRequest(input="hello"))
            await agent.reset()
            self.assertNotEqual(agent.status, AgentStatus.FAILED)

        asyncio.run(scenario())

    def test_request_rejects_blank_input(self) -> None:
        with self.assertRaises(AgentValidationError):
            AgentRequest(input="   ")

    def test_response_rejects_invalid_status(self) -> None:
        with self.assertRaises(AgentValidationError):
            AgentResponse(
                agent_id="test",
                output="output",
                status="INVALID",  # type: ignore[arg-type]
            )


if __name__ == "__main__":
    unittest.main()
