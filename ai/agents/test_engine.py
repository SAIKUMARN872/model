import unittest

from ai.agents import AgentContext, AgentRequest, AgentResponse, AgentStatus
from ai.agents.base.agent import BaseAgent
from ai.agents.engine import AgentEngine


class EchoAgent(BaseAgent):
    def __init__(self, agent_id: str = "echo"):
        super().__init__(agent_id=agent_id, name=f"{agent_id} Agent")

    async def execute(
        self,
        request: AgentRequest,
        context: AgentContext,
    ) -> str:
        return request.input


class AgentEngineTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.engine = AgentEngine()
        self.agent = EchoAgent()
        self.engine.register(self.agent)

    def test_register_and_get_agent(self):
        self.assertIs(self.engine.get_agent("echo"), self.agent)

    def test_duplicate_registration_is_rejected(self):
        with self.assertRaises(ValueError):
            self.engine.register(EchoAgent())

    def test_replace_registered_agent(self):
        replacement = EchoAgent()

        self.engine.register(replacement, replace=True)

        self.assertIs(self.engine.get_agent("echo"), replacement)

    def test_unknown_agent_raises_key_error(self):
        with self.assertRaises(KeyError):
            self.engine.get_agent("unknown")

    def test_unregister_agent(self):
        removed = self.engine.unregister("echo")

        self.assertIs(removed, self.agent)
        self.assertEqual(self.engine.list_agents(), ())

    def test_list_agents_is_sorted(self):
        self.engine.register(EchoAgent("zeta"))
        self.engine.register(EchoAgent("alpha"))

        self.assertEqual(
            self.engine.list_agents(),
            ("alpha", "echo", "zeta"),
        )

    def test_register_rejects_non_agent(self):
        with self.assertRaises(TypeError):
            self.engine.register(object())

    async def test_execute_returns_successful_response(self):
        request = AgentRequest(
            input="ModelNow engine test",
            task_id="engine-test-1",
        )

        response = await self.engine.execute("echo", request)

        self.assertIsInstance(response, AgentResponse)
        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertEqual(response.output, "ModelNow engine test")
        self.assertEqual(response.agent_id, "echo")
        self.assertEqual(response.task_id, "engine-test-1")

    async def test_execute_rejects_invalid_request(self):
        with self.assertRaises(TypeError):
            await self.engine.execute("echo", "not a request")

    async def test_execute_many_returns_all_responses(self):
        requests = [
            AgentRequest(input="first", task_id="task-1"),
            AgentRequest(input="second", task_id="task-2"),
            AgentRequest(input="third", task_id="task-3"),
        ]

        responses = await self.engine.execute_many(
            "echo",
            requests,
            max_concurrency=2,
        )

        self.assertEqual(len(responses), 3)
        self.assertEqual(
            [response.output for response in responses],
            ["first", "second", "third"],
        )
        self.assertTrue(
            all(response.status == AgentStatus.COMPLETED for response in responses)
        )

    async def test_execute_many_rejects_invalid_items(self):
        with self.assertRaises(TypeError):
            await self.engine.execute_many("echo", [object()])


if __name__ == "__main__":
    unittest.main()
