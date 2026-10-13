from __future__ import annotations

import asyncio
import unittest

from ai.agents import AgentContext, AgentRequest, AgentStatus, BaseAgent
from ai.agents.execution import AgentExecutor, AgentRunner, AgentScheduler


class EchoAgent(BaseAgent):
    async def execute(self, request: AgentRequest, context: AgentContext) -> str:
        return request.input


class SlowAgent(BaseAgent):
    async def execute(self, request: AgentRequest, context: AgentContext) -> str:
        await asyncio.sleep(0.1)
        return request.input


class ExecutionTests(unittest.TestCase):
    def test_runner_returns_agent_response(self) -> None:
        async def scenario() -> None:
            response = await AgentRunner(EchoAgent("echo")).run(
                AgentRequest(input="hello", task_id="t1")
            )
            self.assertEqual(response.output, "hello")
            self.assertEqual(response.status, AgentStatus.COMPLETED)

        asyncio.run(scenario())

    def test_runner_timeout(self) -> None:
        async def scenario() -> None:
            agent = SlowAgent("slow")
            runner = AgentRunner(agent, timeout_seconds=0.01)

            response = await runner.run(AgentRequest(input="wait"))

            self.assertEqual(response.status, AgentStatus.FAILED)
            self.assertIn("timed out", response.error or "")
            self.assertEqual(agent.status, AgentStatus.CANCELLED)

            await agent.reset()
            self.assertEqual(agent.status, AgentStatus.READY)

            next_response = await AgentRunner(
                EchoAgent("echo")
            ).run(AgentRequest(input="recovered"))
            self.assertEqual(next_response.output, "recovered")
            self.assertEqual(next_response.status, AgentStatus.COMPLETED)

        asyncio.run(scenario())

    def test_executor_runs_multiple_requests(self) -> None:
        async def scenario() -> None:
            responses = await AgentExecutor().execute_many(
                EchoAgent("echo"),
                [
                    AgentRequest(input="one"),
                    AgentRequest(input="two"),
                ],
            )
            self.assertEqual([r.output for r in responses], ["one", "two"])
            self.assertTrue(
                all(r.status == AgentStatus.COMPLETED for r in responses)
            )

        asyncio.run(scenario())

    def test_scheduler_respects_concurrency_limit(self) -> None:
        async def scenario() -> None:
            active = 0
            peak = 0

            async def task(value: int) -> int:
                nonlocal active, peak
                active += 1
                peak = max(peak, active)
                await asyncio.sleep(0.02)
                active -= 1
                return value

            scheduler = AgentScheduler(max_concurrency=2)
            results = await scheduler.run_many(
                [lambda i=i: task(i) for i in range(5)]
            )
            self.assertEqual(results, [0, 1, 2, 3, 4])
            self.assertLessEqual(peak, 2)

        asyncio.run(scenario())


if __name__ == "__main__":
    unittest.main()
