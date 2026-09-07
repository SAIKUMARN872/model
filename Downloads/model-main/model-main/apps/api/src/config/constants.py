"""
Application Constants

Enterprise-level constants used throughout the application.

Avoid magic strings.
"""

from enum import StrEnum

# ==========================================================
# API
# ==========================================================

API_VERSION = "v1"

DEFAULT_PAGE_SIZE = 20

MAX_PAGE_SIZE = 100

DEFAULT_TIMEOUT = 60

# ==========================================================
# HTTP
# ==========================================================

SUCCESS = "success"

FAILED = "failed"

ERROR = "error"

# ==========================================================
# AI Providers
# ==========================================================


class Provider(StrEnum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"
    GROQ = "groq"
    OLLAMA = "ollama"
    MISTRAL = "mistral"
    DEEPSEEK = "deepseek"


# ==========================================================
# Chat Roles
# ==========================================================


class Role(StrEnum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


# ==========================================================
# AI Models
# ==========================================================


class Model(StrEnum):
    GPT5 = "gpt-5"
    GPT5_MINI = "gpt-5-mini"

    CLAUDE_OPUS = "claude-opus-4"

    CLAUDE_SONNET = "claude-sonnet-4"

    GEMINI_PRO = "gemini-2.5-pro"

    LLAMA = "llama-3.3-70b"

    DEEPSEEK = "deepseek-chat"


# ==========================================================
# Cache Keys
# ==========================================================


class CacheKey(StrEnum):
    USER = "user"

    CHAT = "chat"

    MODEL = "model"

    TOKEN = "token"

    SESSION = "session"


# ==========================================================
# Queue Names
# ==========================================================


class Queue(StrEnum):
    DEFAULT = "default"

    CHAT = "chat"

    EMBEDDING = "embedding"

    RAG = "rag"

    BILLING = "billing"


# ==========================================================
# Storage
# ==========================================================


class Storage(StrEnum):
    LOCAL = "local"

    S3 = "s3"

    AZURE = "azure"

    GCS = "gcs"


# ==========================================================
# File Types
# ==========================================================


ALLOWED_DOCUMENT_TYPES = {
    ".pdf",
    ".docx",
    ".txt",
    ".md",
}

ALLOWED_IMAGE_TYPES = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
}

# ==========================================================
# Metrics
# ==========================================================

REQUEST_COUNTER = "http_requests_total"

LATENCY_HISTOGRAM = "http_request_duration_seconds"

TOKEN_COUNTER = "llm_tokens_total"

# ==========================================================
# Headers
# ==========================================================

HEADER_REQUEST_ID = "X-Request-ID"

HEADER_CORRELATION_ID = "X-Correlation-ID"

HEADER_API_KEY = "X-API-Key"

HEADER_ORGANIZATION = "X-Organization"

# ==========================================================
# Limits
# ==========================================================

MAX_CHAT_MESSAGES = 100

MAX_PROMPT_LENGTH = 100000

MAX_COMPLETION_TOKENS = 4096

MAX_FILE_SIZE_MB = 100

# ==========================================================
# Events
# ==========================================================


class Event(StrEnum):
    USER_CREATED = "user.created"

    CHAT_CREATED = "chat.created"

    CHAT_COMPLETED = "chat.completed"

    FILE_UPLOADED = "file.uploaded"

    MODEL_SELECTED = "model.selected"

    MODEL_FAILED = "model.failed"  