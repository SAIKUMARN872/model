"""
AI Models Enumeration

Enterprise AI Model Definitions
"""

from __future__ import annotations

from enum import Enum


# ==========================================================
# AI Models
# ==========================================================

class AIModel(str, Enum):
    """
    Supported AI Models
    """

    # -------------------------
    # OpenAI
    # -------------------------

    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"
    GPT_5 = "gpt-5"
    GPT_5_MINI = "gpt-5-mini"

    # -------------------------
    # Anthropic
    # -------------------------

    CLAUDE_3_HAIKU = "claude-3-haiku"
    CLAUDE_3_SONNET = "claude-3-sonnet"
    CLAUDE_3_OPUS = "claude-3-opus"

    # -------------------------
    # Google
    # -------------------------

    GEMINI_2_FLASH = "gemini-2.0-flash"
    GEMINI_2_PRO = "gemini-2.0-pro"

    # -------------------------
    # Grok
    # -------------------------

    GROK_3 = "grok-3"

    # -------------------------
    # Meta
    # -------------------------

    LLAMA_3_8B = "llama3-8b"
    LLAMA_3_70B = "llama3-70b"

    # -------------------------
    # Mistral
    # -------------------------

    MISTRAL_LARGE = "mistral-large"
    MIXTRAL_8X7B = "mixtral-8x7b"


# ==========================================================
# Model Status
# ==========================================================

class ModelStatus(str, Enum):
    """
    AI Model Status
    """

    AVAILABLE = "available"
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISABLED = "disabled"
    DEPRECATED = "deprecated"
    MAINTENANCE = "maintenance"


# ==========================================================
# Model Type
# ==========================================================

class ModelType(str, Enum):
    """
    Model Categories
    """

    CHAT = "chat"
    EMBEDDING = "embedding"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    MULTIMODAL = "multimodal"
    CODE = "code"
    RERANKER = "reranker"


# ==========================================================
# Model Capability
# ==========================================================

class ModelCapability(str, Enum):
    """
    AI Capabilities
    """

    CHAT = "chat"
    STREAMING = "streaming"
    FUNCTION_CALLING = "function_calling"
    TOOL_CALLING = "tool_calling"
    VISION = "vision"
    AUDIO = "audio"
    EMBEDDINGS = "embeddings"
    JSON_MODE = "json_mode"
    REASONING = "reasoning"
    LONG_CONTEXT = "long_context" 