from __future__ import annotations

from collections.abc import Awaitable, Callable

from ai.agents import AgentContext, AgentRequest, AgentResponse, AgentStatus, BaseAgent

from .conversation import ChatMessage, Conversation
from .response import ChatResponse


ResponseGenerator = Callable[[Conversation], Awaitable[str]]


class ChatAgent(BaseAgent):
    """Provider-independent chat agent using an injected async generator."""

    def __init__(
        self,
        agent_id: str,
        response_generator: ResponseGenerator,
        system_prompt: str | None = None,
    ) -> None:
        super().__init__(agent_id)
        if not callable(response_generator):
            raise TypeError("response_generator must be callable")
        if system_prompt is not None and (
            not isinstance(system_prompt, str) or not system_prompt.strip()
        ):
            raise ValueError("system_prompt must be None or a non-empty string")

        self.response_generator = response_generator
        self.system_prompt = system_prompt
        self.conversations: dict[str, Conversation] = {}

    @staticmethod
    def _conversation_id(
        request: AgentRequest,
        context: AgentContext,
    ) -> str:
        return (
            context.conversation_id
            or context.metadata.get("conversation_id")
            or request.context.conversation_id
            or request.task_id
            or "default"
        )

    async def execute(self, request: AgentRequest, context: AgentContext) -> str:
        conversation_id = self._conversation_id(request, context)
        conversation = self.conversations.setdefault(
            conversation_id,
            Conversation(conversation_id=conversation_id),
        )

        user_message = ChatMessage(role="user", content=request.input)
        conversation.add_message(user_message)

        try:
            # Give the generator a snapshot so it cannot mutate stored history.
            prompt_conversation = Conversation(
                conversation_id=conversation.conversation_id,
                messages=conversation.history(),
                metadata=dict(conversation.metadata),
            )
            output = await self.response_generator(prompt_conversation)

            if not isinstance(output, str) or not output.strip():
                raise ValueError("Response generator returned empty or invalid text")

            conversation.add_message(
                ChatMessage(role="assistant", content=output.strip())
            )
            return output.strip()
        except Exception:
            # Remove only the unanswered user turn added by this invocation.
            if user_message in conversation.messages:
                conversation.messages.remove(user_message)
            raise

    def get_conversation(self, conversation_id: str) -> Conversation | None:
        return self.conversations.get(conversation_id)

    def clear_conversation(self, conversation_id: str) -> bool:
        return self.conversations.pop(conversation_id, None) is not None

    async def chat(
        self,
        request: AgentRequest,
        context: AgentContext | None = None,
    ) -> ChatResponse:
        active_context = context or request.context
        conversation_id = self._conversation_id(request, active_context)

        # BaseAgent.run() accepts only AgentRequest and uses request.context.
        if active_context is not request.context:
            request = AgentRequest(
                input=request.input,
                context=active_context,
                task_id=request.task_id,
                metadata=dict(request.metadata),
            )

        result: AgentResponse = await self.run(request)
        if result.status != AgentStatus.COMPLETED:
            raise RuntimeError(result.error or "Chat agent execution failed")

        conversation = self.get_conversation(conversation_id)
        assistant_message = (
            conversation.messages[-1]
            if conversation and conversation.messages
            else None
        )

        return ChatResponse(
            content=result.output,
            conversation_id=conversation_id,
            message_id=(
                assistant_message.message_id
                if assistant_message and assistant_message.role == "assistant"
                else ChatResponse(content=result.output, conversation_id=conversation_id).message_id
            ),
        )
