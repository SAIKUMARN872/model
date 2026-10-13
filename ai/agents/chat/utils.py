from __future__ import annotations

from .conversation import ChatMessage, Conversation


def validate_conversation(conversation: Conversation) -> None:
    if not isinstance(conversation, Conversation):
        raise TypeError("conversation must be a Conversation instance")
    for message in conversation.messages:
        if not isinstance(message, ChatMessage):
            raise TypeError("conversation contains an invalid message")


def build_prompt(
    conversation: Conversation,
    system_prompt: str | None = None,
) -> str:
    validate_conversation(conversation)
    lines: list[str] = []

    if system_prompt is not None:
        if not system_prompt.strip():
            raise ValueError("system_prompt must not be blank when provided")
        lines.append(f"System: {system_prompt.strip()}")

    for message in conversation.messages:
        lines.append(f"{message.role.capitalize()}: {message.content}")

    if not lines:
        raise ValueError("Cannot build a prompt from an empty conversation")

    return "\n".join(lines)
