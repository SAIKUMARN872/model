"""
Chat agent implementation for ModelNow.

ChatAgent manages:
    - conversations
    - message history
    - base agent execution
    - chat responses
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from agents.base import (
    BaseAgent,
    BaseAgentConfig,
    BaseAgentContext,
    BaseAgentState,
)

from .conversation import (
    Conversation,
    ConversationManager,
)
from .response import (
    ChatResponse,
    ChatUsage,
)
from .utils import (
    build_chat_history,
    clean_response,
    validate_message,
)


class ChatAgentError(Exception):
    """Base chat-agent error."""


class ChatConfigurationError(
    ChatAgentError
):
    """Invalid chat configuration."""


@dataclass
class ChatConfig:
    """
    Configuration for ChatAgent.
    """

    name: str = "chat-agent"

    description: str = (
        "ModelNow conversational agent"
    )

    system_prompt: str = ""

    max_history_messages: int = 50

    max_iterations: int = 10

    model: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if (
            self.max_history_messages
            <= 0
        ):
            raise ValueError(
                "max_history_messages "
                "must be positive"
            )

        if self.max_iterations <= 0:
            raise ValueError(
                "max_iterations "
                "must be positive"
            )


class ChatAgent(BaseAgent):
    """
    Conversational agent built on top of BaseAgent.

    The response_handler is responsible for generating the
    actual answer. It can be synchronous or asynchronous.

    Handler signature:

        handler(
            context,
            state,
            messages
        )

    Example:

        async def handler(
            context,
            state,
            messages,
        ):
            return f"Hello {context.user_input}"
    """

    def __init__(
        self,
        config: ChatConfig | None = None,
        response_handler: Callable[
            ...,
            Any,
        ] | None = None,
        conversation_manager: ConversationManager | None = None,
        tools: dict[
            str,
            Callable[..., Any],
        ] | None = None,
    ) -> None:

        config = (
            config
            or ChatConfig()
        )

        if response_handler is None:
            raise ChatConfigurationError(
                "response_handler is required"
            )

        self.chat_config = config

        self.response_handler = (
            response_handler
        )

        self.conversations = (
            conversation_manager
            or ConversationManager()
        )

        super().__init__(
            config=BaseAgentConfig(
                name=config.name,
                description=config.description,
                system_prompt=config.system_prompt,
                max_iterations=config.max_iterations,
                metadata=config.metadata,
            ),
            tools=tools,
        )

    def create_conversation(
        self,
        user_id: str | None = None,
        title: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> Conversation:

        return self.conversations.create(
            user_id=user_id,
            title=title,
            metadata=metadata,
        )

    def get_conversation(
        self,
        conversation_id: str,
    ) -> Conversation:

        return self.conversations.require(
            conversation_id
        )

    async def chat(
        self,
        message: str,
        conversation_id: str | None = None,
        user_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ChatResponse:
        """
        Send a message to the chat agent.
        """

        try:

            message = validate_message(
                message
            )

            if conversation_id:

                conversation = (
                    self.get_conversation(
                        conversation_id
                    )
                )

            else:

                conversation = (
                    self.create_conversation(
                        user_id=user_id,
                        metadata=metadata,
                    )
                )

            conversation.add_user_message(
                message,
                metadata=metadata,
            )

            context = self.create_chat_context(
                conversation=conversation,
                user_input=message,
                user_id=user_id,
                metadata=metadata,
            )

            self.state_manager.start(
                message
            )

            self.state_manager.record_input(
                message
            )

            self.state_manager.increment_iteration()

            output = await self._generate_response(
                context,
                self.state,
                conversation,
            )

            output = clean_response(
                output
            )

            if not output:

                raise ChatAgentError(
                    "Agent returned an empty response"
                )

            self.state_manager.record_output(
                output
            )

            conversation.add_assistant_message(
                output
            )

            self.state_manager.complete(
                output
            )

            usage = self._build_usage(
                message=message,
                output=output,
            )

            return ChatResponse.success_response(
                content=output,
                conversation_id=(
                    conversation.conversation_id
                ),
                usage=usage,
                metadata={
                    "agent_id": self.agent_id,
                    "agent_name": self.name,
                    "message_count": (
                        conversation.message_count()
                    ),
                },
            )

        except Exception as exc:

            error = str(exc).strip()

            if not error:
                error = exc.__class__.__name__

            self.state_manager.fail(
                error
            )

            return ChatResponse.error_response(
                error=error,
                conversation_id=(
                    conversation_id
                    if conversation_id
                    else None
                ),
            )

    def chat_sync(
        self,
        message: str,
        conversation_id: str | None = None,
        user_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ChatResponse:
        """
        Synchronous convenience method.
        """

        from agents.base.utils import run_sync

        return run_sync(
            self.chat(
                message=message,
                conversation_id=conversation_id,
                user_id=user_id,
                metadata=metadata,
            )
        )

    async def _generate_response(
        self,
        context: BaseAgentContext,
        state: BaseAgentState,
        conversation: Conversation,
    ) -> Any:

        messages = conversation.get_messages(
            self.chat_config.max_history_messages
        )

        history = build_chat_history(
            messages
        )

        result = await self._execute_response_handler(
            context=context,
            state=state,
            messages=history,
        )

        return result

    async def _execute_response_handler(
        self,
        context: BaseAgentContext,
        state: BaseAgentState,
        messages: list[dict[str, str]],
    ) -> Any:

        from agents.base.utils import execute

        return await execute(
            self.response_handler,
            context,
            state,
            messages,
        )

    def create_chat_context(
        self,
        conversation: Conversation,
        user_input: str,
        user_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> BaseAgentContext:

        context = self.create_context(
            user_input=user_input,
            session_id=(
                conversation.conversation_id
            ),
            user_id=user_id
            or conversation.user_id,
            metadata={
                **conversation.metadata,
                **(metadata or {}),
            },
        )

        context.set(
            "conversation_id",
            conversation.conversation_id,
        )

        context.set(
            "conversation_history",
            build_chat_history(
                conversation.get_messages(
                    self.chat_config.max_history_messages
                )
            ),
        )

        return context

    @staticmethod
    def _build_usage(
        message: str,
        output: str,
    ) -> ChatUsage:

        from .utils import approximate_tokens

        input_tokens = approximate_tokens(
            message
        )

        output_tokens = approximate_tokens(
            output
        )

        return ChatUsage(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=(
                input_tokens
                + output_tokens
            ),
        )

    def clear_conversation(
        self,
        conversation_id: str,
    ) -> None:

        conversation = (
            self.get_conversation(
                conversation_id
            )
        )

        conversation.clear()

    def delete_conversation(
        self,
        conversation_id: str,
    ) -> bool:

        return self.conversations.delete(
            conversation_id
        )

    def list_conversations(
        self,
        user_id: str,
    ) -> list[Conversation]:

        return self.conversations.list_for_user(
            user_id
        )