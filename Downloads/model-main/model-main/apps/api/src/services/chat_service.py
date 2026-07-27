"""
Chat service.

Handles AI conversations, message storage, chat history,
streaming responses, and conversation management.
"""

from __future__ import annotations

from typing import AsyncGenerator, Any

from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationResponse,
)
from app.services.ai_services import AIService
from app.repositories.chat import ChatRepository


class ChatService:
    """
    Chat business logic layer.
    """

    def __init__(
        self,
        repository: ChatRepository | None = None,
        ai_service: AIService | None = None,
    ) -> None:

        self._repository = repository or ChatRepository()

        self._ai_service = ai_service or AIService()


    async def chat(
        self,
        user: Any,
        request: ChatRequest,
    ) -> ChatResponse:
        """
        Generate AI chat response.
        """

        conversation = None

        if request.conversation_id:
            conversation = await self._repository.get_conversation(
                request.conversation_id,
                user.id,
            )

        else:
            conversation = await self._repository.create_conversation(
                user_id=user.id,
            )


        await self._repository.save_message(
            conversation_id=conversation.id,
            role="user",
            content=request.message,
        )


        response = await self._ai_service.chat(
            request,
        )


        await self._repository.save_message(
            conversation_id=conversation.id,
            role="assistant",
            content=response.message.content,
        )


        return response


    async def stream_chat(
        self,
        user: Any,
        request: ChatRequest,
    ) -> AsyncGenerator[str, None]:
        """
        Stream AI response.
        """

        conversation = None


        if request.conversation_id:
            conversation = await self._repository.get_conversation(
                request.conversation_id,
                user.id,
            )

        else:
            conversation = await self._repository.create_conversation(
                user_id=user.id,
            )


        await self._repository.save_message(
            conversation_id=conversation.id,
            role="user",
            content=request.message,
        )


        full_response = ""


        async for chunk in self._ai_service.stream_chat(
            request,
        ):

            full_response += chunk

            yield chunk



        await self._repository.save_message(
            conversation_id=conversation.id,
            role="assistant",
            content=full_response,
        )


    async def list_conversations(
        self,
        user_id: str,
    ) -> list[ConversationResponse]:
        """
        Get user conversations.
        """

        conversations = await self._repository.list_conversations(
            user_id,
        )


        return [
            ConversationResponse.model_validate(
                item,
                from_attributes=True,
            )
            for item in conversations
        ]


    async def get_conversation(
        self,
        conversation_id: str,
        user_id: str,
    ) -> ConversationResponse | None:
        """
        Get conversation details.
        """

        conversation = await self._repository.get_conversation(
            conversation_id,
            user_id,
        )


        if not conversation:
            return None


        return ConversationResponse.model_validate(
            conversation,
            from_attributes=True,
        )


    async def delete_conversation(
        self,
        conversation_id: str,
        user_id: str,
    ) -> None:
        """
        Delete conversation.
        """

        await self._repository.delete_conversation(
            conversation_id,
            user_id,
        )


    async def chat_history(
        self,
        user_id: str,
    ) -> list[dict[str, Any]]:
        """
        Retrieve chat history.
        """

        return await self._repository.get_history(
            user_id,
        )


    async def rename_conversation(
        self,
        conversation_id: str,
        user_id: str,
        title: str,
    ) -> ConversationResponse:
        """
        Rename conversation.
        """

        conversation = await self._repository.rename_conversation(
            conversation_id=conversation_id,
            user_id=user_id,
            title=title,
        )


        return ConversationResponse.model_validate(
            conversation,
            from_attributes=True,
        )