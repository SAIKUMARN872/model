"""
System Constants

Enterprise System Configuration Constants.
"""

from __future__ import annotations

# ==========================================================
# APPLICATION
# ==========================================================

APP_NAME = "ModelNow AI"

APP_DESCRIPTION = "Enterprise AI Platform"

APP_VERSION = "1.0.0"

APP_AUTHOR = "ModelNow Team"

COMPANY_NAME = "ModelNow"

# ==========================================================
# ENVIRONMENTS
# ==========================================================

ENV_DEVELOPMENT = "development"

ENV_TESTING = "testing"

ENV_STAGING = "staging"

ENV_PRODUCTION = "production"

SUPPORTED_ENVIRONMENTS = (
    ENV_DEVELOPMENT,
    ENV_TESTING,
    ENV_STAGING,
    ENV_PRODUCTION,
)

# ==========================================================
# TIMEZONE
# ==========================================================

DEFAULT_TIMEZONE = "UTC"

DEFAULT_ENCODING = "utf-8"

# ==========================================================
# LOGGING
# ==========================================================

DEFAULT_LOG_LEVEL = "INFO"

LOG_FORMAT = (
    "%(asctime)s | %(levelname)s | "
    "%(name)s | %(message)s"
)

# ==========================================================
# DATABASE
# ==========================================================

DEFAULT_DB_POOL_SIZE = 20

DEFAULT_DB_MAX_OVERFLOW = 40

DEFAULT_DB_TIMEOUT = 30

# ==========================================================
# REDIS
# ==========================================================

DEFAULT_REDIS_DB = 0

DEFAULT_REDIS_PORT = 6379

REDIS_KEY_PREFIX = "modelnow"

# ==========================================================
# CACHE
# ==========================================================

DEFAULT_CACHE_TTL = 300

LONG_CACHE_TTL = 3600

SHORT_CACHE_TTL = 60

# ==========================================================
# STORAGE
# ==========================================================

UPLOAD_DIRECTORY = "uploads"

TEMP_DIRECTORY = "tmp"

EXPORT_DIRECTORY = "exports"

MAX_UPLOAD_SIZE_MB = 100

# ==========================================================
# AI PROVIDERS
# ==========================================================

OPENAI_PROVIDER = "openai"

ANTHROPIC_PROVIDER = "anthropic"

GEMINI_PROVIDER = "gemini"

GROK_PROVIDER = "grok"

SUPPORTED_AI_PROVIDERS = [
    OPENAI_PROVIDER,
    ANTHROPIC_PROVIDER,
    GEMINI_PROVIDER,
    GROK_PROVIDER,
]

# ==========================================================
# DEFAULT MODELS
# ==========================================================

DEFAULT_CHAT_MODEL = "gpt-5-mini"

DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small"

DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"

DEFAULT_CLAUDE_MODEL = "claude-sonnet-4"

DEFAULT_GROK_MODEL = "grok-4"

# ==========================================================
# MESSAGE ROLES
# ==========================================================

ROLE_SYSTEM = "system"

ROLE_USER = "user"

ROLE_ASSISTANT = "assistant"

ROLE_TOOL = "tool"

# ==========================================================
# TASK STATUS
# ==========================================================

STATUS_PENDING = "pending"

STATUS_RUNNING = "running"

STATUS_COMPLETED = "completed"

STATUS_FAILED = "failed"

STATUS_CANCELLED = "cancelled"

# ==========================================================
# HEALTH
# ==========================================================

HEALTH_OK = "ok"

HEALTH_WARNING = "warning"

HEALTH_ERROR = "error"

# ==========================================================
# PAGINATION
# ==========================================================

DEFAULT_PAGE = 1

DEFAULT_PAGE_SIZE = 20

MAX_PAGE_SIZE = 100

# ==========================================================
# FILE TYPES
# ==========================================================

SUPPORTED_DOCUMENT_TYPES = [
    ".pdf",
    ".docx",
    ".txt",
    ".csv",
    ".xlsx",
]

SUPPORTED_IMAGE_TYPES = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
]

# ==========================================================
# MIME TYPES
# ==========================================================

APPLICATION_JSON = "application/json"

TEXT_PLAIN = "text/plain"

APPLICATION_PDF = "application/pdf"

# ==========================================================
# METRICS
# ==========================================================

METRICS_NAMESPACE = "modelnow"

REQUEST_COUNTER = "http_requests_total"

REQUEST_LATENCY = "http_request_duration_seconds"

ACTIVE_CONNECTIONS = "active_connections"

# ==========================================================
# VERSION
# ==========================================================

API_VERSION = "v1"

SCHEMA_VERSION = "1.0" 