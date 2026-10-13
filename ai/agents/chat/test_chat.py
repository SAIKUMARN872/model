from __future__ import annotations

import asyncio
import unittest

from ai.agents import AgentContext, AgentRequest, AgentStatus
from ai.agents.chat import (
    ChatAgent,
    ChatMessage,
    ChatResponse,
    Conversation,
    build_prompt,
)


class ChatAgentTests(unittest.TestCase):
    def test_chat_agent_returns_generated_response(self) -> None:
        async def scenario() -> None:
            async def generator(conversation: Conversation) -> str:
                return "Hello from test generator"

            agent = ChatAgent("chat-test", generator)
            result = await agent.chat(AgentRequest(input="Hello"))

            self.assertEqual(result.content, "Hello from test generator")
            self.assertEqual(result.conversation_id, "default")
            self.assertEqual(agent.status, AgentStatus.READY)

        asyncio.run(scenario())

    def test_conversation_keeps_turn_history(self) -> None:
        async def scenario() -> None:
            async def generator(conversation: Conversation) -> str:
                return f"Received: {conversation.messages[-1].content}"

            agent = ChatAgent("history-test", generator)
            context = AgentContext(conversation_id="conversation-1")

            await agent.chat(AgentRequest(input="first", context=context))
            await agent.chat(AgentRequest(input="second", context=context))

            conversation = agent.get_conversation("conversation-1")
            self.assertIsNotNone(conversation)
            self.assertEqual(len(conversation.messages), 4)
            self.assertEqual(conversation.messages[-2].content, "second")

        asyncio.run(scenario())

    def test_failed_generator_does_not_leave_unanswered_turn(self) -> None:
        async def scenario() -> None:
            async def generator(conversation: Conversation) -> str:
                raise RuntimeError("generator failure")

            agent = ChatAgent("failure-test", generator)
            result = await agent.run(AgentRequest(input="hello"))

            self.assertEqual(result.status, AgentStatus.FAILED)
            conversation = agent.get_conversation("default")
            self.assertIsNotNone(conversation)
            self.assertEqual(conversation.messages, [])

        asyncio.run(scenario())

    def test_conversation_history_limit(self) -> None:
        conversation = Conversation(
            messages=[
                ChatMessage(role="user", content="one"),
                ChatMessage(role="assistant", content="two"),
            ]
        )
        self.assertEqual(len(conversation.history(1)), 1)
        self.assertEqual(len(conversation.history()), 2)

    def test_build_prompt(self) -> None:
        conversation = Conversation(
            messages=[ChatMessage(role="user", content="What is AI?")]
        )
        prompt = build_prompt(conversation, "Be concise")
        self.assertIn("System: Be concise", prompt)
        self.assertIn("User: What is AI?", prompt)

    def test_response_rejects_negative_usage(self) -> None:
        with self.assertRaises(ValueError):
            ChatResponse(
                content="answer",
                conversation_id="c1",
                usage={"tokens": -1},
            )

    def test_clear_conversation(self) -> None:
        async def scenario() -> None:
            async def generator(conversation: Conversation) -> str:
                return "answer"

            agent = ChatAgent("clear-test", generator)
            await agent.chat(
                AgentRequest(
                    input="hello",
                    context=AgentContext(conversation_id="c1"),
                )
            )
            self.assertTrue(agent.clear_conversation("c1"))
            self.assertIsNone(agent.get_conversation("c1"))
            self.assertFalse(agent.clear_conversation("c1"))

        asyncio.run(scenario())


if __name__ == "__main__":
    unittest.main()
