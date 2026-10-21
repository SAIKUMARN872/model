import asyncio

from ai.agents import AgentContext, AgentRequest, AgentResponse, AgentStatus
from ai.agents.base.agent import BaseAgent
from ai.agents.engine import AgentEngine


class EchoAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_id="echo", name="Echo Agent")

    async def execute(
        self,
        request: AgentRequest,
        context: AgentContext,
    ) -> str:
        return request.input


async def main():
    engine = AgentEngine()
    agent = EchoAgent()

    engine.register(agent)
    assert engine.get_agent("echo") is agent
    assert "echo" in engine.list_agents()
    print("ENGINE REGISTRATION PASS")

    response = await engine.execute(
        "echo",
        AgentRequest(input="ModelNow engine test", task_id="engine-test-1"),
    )

    assert response.status == AgentStatus.COMPLETED, repr(response)
    assert response.output == "ModelNow engine test", repr(response)
    assert response.task_id == "engine-test-1"
    print("ENGINE EXECUTION PASS")
    print("ENGINE RESPONSE PASS")

    removed = engine.unregister("echo")
    assert removed is agent
    assert engine.list_agents() == ()
    print("ENGINE UNREGISTER PASS")


if __name__ == "__main__":
    asyncio.run(main())
