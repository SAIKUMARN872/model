"""
API Constants

Centralized API configuration constants.
"""

from __future__ import annotations

# ==========================================================
# API INFORMATION
# ==========================================================

API_NAME = "ModelNow AI API"

API_TITLE = "ModelNow AI Platform"

API_DESCRIPTION = (
    "Enterprise AI Platform built with FastAPI."
)

API_VERSION = "v1"

API_PREFIX = "/api"

API_V1_PREFIX = f"{API_PREFIX}/v1"

# ==========================================================
# DOCUMENTATION
# ==========================================================

DOCS_URL = "/docs"

REDOC_URL = "/redoc"

OPENAPI_URL = "/openapi.json"

# ==========================================================
# PAGINATION
# ==========================================================

DEFAULT_PAGE = 1

DEFAULT_PAGE_SIZE = 20

MAX_PAGE_SIZE = 100

DEFAULT_LIMIT = 20

MAX_LIMIT = 100

# ==========================================================
# REQUESTS
# ==========================================================

DEFAULT_TIMEOUT = 60

MAX_REQUEST_SIZE_MB = 50

MAX_UPLOAD_SIZE_MB = 100

# ==========================================================
# RATE LIMIT
# ==========================================================

DEFAULT_RATE_LIMIT = "100/minute"

AUTH_RATE_LIMIT = "10/minute"

UPLOAD_RATE_LIMIT = "20/minute"

CHAT_RATE_LIMIT = "60/minute"

# ==========================================================
# CONTENT TYPES
# ==========================================================

CONTENT_TYPE_JSON = "application/json"

CONTENT_TYPE_TEXT = "text/plain"

CONTENT_TYPE_PDF = "application/pdf"

CONTENT_TYPE_DOCX = (
    "application/vnd.openxmlformats-officedocument."
    "wordprocessingml.document"
)

CONTENT_TYPE_CSV = "text/csv"

CONTENT_TYPE_XLSX = (
    "application/vnd.openxmlformats-officedocument."
    "spreadsheetml.sheet"
)

# ==========================================================
# HTTP METHODS
# ==========================================================

HTTP_GET = "GET"

HTTP_POST = "POST"

HTTP_PUT = "PUT"

HTTP_PATCH = "PATCH"

HTTP_DELETE = "DELETE"

# ==========================================================
# HTTP STATUS CODES
# ==========================================================

HTTP_OK = 200

HTTP_CREATED = 201

HTTP_ACCEPTED = 202

HTTP_NO_CONTENT = 204

HTTP_BAD_REQUEST = 400

HTTP_UNAUTHORIZED = 401

HTTP_FORBIDDEN = 403

HTTP_NOT_FOUND = 404

HTTP_CONFLICT = 409

HTTP_UNPROCESSABLE_ENTITY = 422

HTTP_TOO_MANY_REQUESTS = 429

HTTP_INTERNAL_SERVER_ERROR = 500

HTTP_SERVICE_UNAVAILABLE = 503

# ==========================================================
# CORS
# ==========================================================

DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

DEFAULT_ALLOWED_METHODS = [
    "*",
]

DEFAULT_ALLOWED_HEADERS = [
    "*",
]

# ==========================================================
# CACHE
# ==========================================================

DEFAULT_CACHE_TTL = 300

HEALTH_CACHE_TTL = 30

MODEL_CACHE_TTL = 3600

USER_CACHE_TTL = 600

# ==========================================================
# HEALTH CHECK
# ==========================================================

HEALTH_ENDPOINT = "/health"

READINESS_ENDPOINT = "/health/readiness"

LIVENESS_ENDPOINT = "/health/liveness"

# ==========================================================
# AI
# ==========================================================

DEFAULT_AI_MODEL = "gpt-5-mini"

DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small"

DEFAULT_TEMPERATURE = 0.7

DEFAULT_MAX_TOKENS = 1024 