"""
ModelNow Chat package.

Provides conversational agents, conversation management,
chat messages, responses, and chat utilities.
"""

from .chat_agent import (
    ChatAgent,
    ChatAgentError,
    ChatConfig,
    ChatConfigurationError,
)

from .conversation import (
    ChatMessage,
    Conversation,
    ConversationError,
    ConversationManager,
    ConversationNotFoundError,
)

from .response import (
    ChatResponse,
    ChatUsage,
)

from .utils import (
    approximate_tokens,
    build_chat_history,
    clean_response,
    contains_command,
    conversation_token_estimate,
    count_characters,
    normalize_message,
    sanitize_metadata,
    truncate_history,
    validate_message,
)


__all__ = [
    # Chat Agent
    "ChatAgent",
    "ChatConfig",
    "ChatAgentError",
    "ChatConfigurationError",

    # Conversation
    "ChatMessage",
    "Conversation",
    "ConversationManager",
    "ConversationError",
    "ConversationNotFoundError",

    # Response
    "ChatResponse",
    "ChatUsage",

    # Utilities
    "normalize_message",
    "validate_message",
    "build_chat_history",
    "approximate_tokens",
    "conversation_token_estimate",
    "count_characters",
    "sanitize_metadata",
    "truncate_history",
    "clean_response",
    "contains_command",
]


__version__ = "1.0.0"