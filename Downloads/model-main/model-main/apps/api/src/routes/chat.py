"""
Chat API routes.

Provides endpoints for AI chat, chat history, conversations,
streaming responses, and conversation management.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.auth.dependencies import get_current_user
from app.responses.response import ApiResponse
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationResponse,
)
from app.services.chat import ChatService

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


def get_chat_service() -> ChatService:
    """
    Chat service dependency.
    """
    return ChatService()


@router.post(
    "",
    response_model=ApiResponse[ChatResponse],
    summary="Generate chat response",
)
async def chat(
    request: ChatRequest,
    current_user=Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
) -> ApiResponse[ChatResponse]:
    """
    Generate an AI response.
    """

    response = await service.chat(
        user=current_user,
        request=request,
    )

    return ApiResponse.ok(
        data=response,
        message="Response generated successfully.",
    )


@router.post(
    "/stream",
    summary="Stream chat response",
)
async def stream_chat(
    request: ChatRequest,
    current_user=Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
) -> StreamingResponse:
    """
    Stream AI response using Server-Sent Events (SSE).
    """

    generator = service.stream_chat(
        user=current_user,
        request=request,
    )

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
    )


@router.get(
    "/conversations",
    response_model=ApiResponse[list[ConversationResponse]],
    summary="List conversations",
)
async def list_conversations(
    current_user=Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
) -> ApiResponse[list[ConversationResponse]]:
    """
    List all conversations.
    """

    conversations = await service.list_conversations(
        current_user.id,
    )

    return ApiResponse.ok(
        data=conversations,
        message="Conversations retrieved successfully.",
    )


@router.get(
    "/conversations/{conversation_id}",
    response_model=ApiResponse[ConversationResponse],
    summary="Get conversation",
)
async def get_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
) -> ApiResponse[ConversationResponse]:
    """
    Retrieve a conversation.
    """

    conversation = await service.get_conversation(
        conversation_id=conversation_id,
        user_id=current_user.id,
    )

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    return ApiResponse.ok(
        data=conversation,
        message="Conversation retrieved successfully.",
    )


@router.delete(
    "/conversations/{conversation_id}",
    response_model=ApiResponse[dict[str, Any]],
    summary="Delete conversation",
)
async def delete_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Delete a conversation.
    """

    await service.delete_conversation(
        conversation_id=conversation_id,
        user_id=current_user.id,
    )

    return ApiResponse.ok(
        data={},
        message="Conversation deleted successfully.",
    )


@router.get(
    "/history",
    response_model=ApiResponse[list[dict[str, Any]]],
    summary="Chat history",
)
async def chat_history(
    current_user=Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
) -> ApiResponse[list[dict[str, Any]]]:
    """
    Retrieve the user's chat history.
    """

    history = await service.chat_history(
        current_user.id,
    )

    return ApiResponse.ok(
        data=history,
        message="Chat history retrieved successfully.",
    )


@router.post(
    "/conversations/{conversation_id}/title",
    response_model=ApiResponse[ConversationResponse],
    summary="Rename conversation",
)
async def rename_conversation(
    conversation_id: str,
    title: str,
    current_user=Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
) -> ApiResponse[ConversationResponse]:
    """
    Update a conversation title.
    """

    conversation = await service.rename_conversation(
        conversation_id=conversation_id,
        user_id=current_user.id,
        title=title,
    )

    return ApiResponse.ok(
        data=conversation,
        message="Conversation updated successfully.",
    ) 