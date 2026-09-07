"""
Error Constants

Centralized error codes and messages.
"""

from __future__ import annotations

# ==========================================================
# GENERAL ERRORS
# ==========================================================

ERROR_UNKNOWN = "UNKNOWN_ERROR"

ERROR_INTERNAL_SERVER = "INTERNAL_SERVER_ERROR"

ERROR_BAD_REQUEST = "BAD_REQUEST"

ERROR_VALIDATION = "VALIDATION_ERROR"

ERROR_CONFLICT = "RESOURCE_CONFLICT"

ERROR_NOT_FOUND = "RESOURCE_NOT_FOUND"

ERROR_TIMEOUT = "REQUEST_TIMEOUT"

ERROR_SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"

# ==========================================================
# AUTHENTICATION
# ==========================================================

ERROR_UNAUTHORIZED = "UNAUTHORIZED"

ERROR_FORBIDDEN = "FORBIDDEN"

ERROR_INVALID_CREDENTIALS = "INVALID_CREDENTIALS"

ERROR_INVALID_TOKEN = "INVALID_TOKEN"

ERROR_TOKEN_EXPIRED = "TOKEN_EXPIRED"

ERROR_REFRESH_TOKEN_EXPIRED = "REFRESH_TOKEN_EXPIRED"

ERROR_PERMISSION_DENIED = "PERMISSION_DENIED"

ERROR_ACCOUNT_DISABLED = "ACCOUNT_DISABLED"

ERROR_ACCOUNT_LOCKED = "ACCOUNT_LOCKED"

ERROR_EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED"

# ==========================================================
# USER ERRORS
# ==========================================================

ERROR_USER_NOT_FOUND = "USER_NOT_FOUND"

ERROR_USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS"

ERROR_EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS"

ERROR_USERNAME_ALREADY_EXISTS = "USERNAME_ALREADY_EXISTS"

ERROR_PASSWORD_MISMATCH = "PASSWORD_MISMATCH"

# ==========================================================
# CHAT ERRORS
# ==========================================================

ERROR_CHAT_NOT_FOUND = "CHAT_NOT_FOUND"

ERROR_CHAT_ALREADY_EXISTS = "CHAT_ALREADY_EXISTS"

ERROR_MESSAGE_NOT_FOUND = "MESSAGE_NOT_FOUND"

ERROR_EMPTY_MESSAGE = "EMPTY_MESSAGE"

# ==========================================================
# MODEL ERRORS
# ==========================================================

ERROR_MODEL_NOT_FOUND = "MODEL_NOT_FOUND"

ERROR_MODEL_DISABLED = "MODEL_DISABLED"

ERROR_PROVIDER_NOT_SUPPORTED = "PROVIDER_NOT_SUPPORTED"

ERROR_INVALID_PROVIDER = "INVALID_PROVIDER"

ERROR_CONTEXT_LIMIT_EXCEEDED = "CONTEXT_LIMIT_EXCEEDED"

# ==========================================================
# FILE ERRORS
# ==========================================================

ERROR_FILE_NOT_FOUND = "FILE_NOT_FOUND"

ERROR_FILE_TOO_LARGE = "FILE_TOO_LARGE"

ERROR_INVALID_FILE = "INVALID_FILE"

ERROR_UNSUPPORTED_FILE_TYPE = "UNSUPPORTED_FILE_TYPE"

ERROR_UPLOAD_FAILED = "UPLOAD_FAILED"

ERROR_DOWNLOAD_FAILED = "DOWNLOAD_FAILED"

# ==========================================================
# DATABASE ERRORS
# ==========================================================

ERROR_DATABASE = "DATABASE_ERROR"

ERROR_DATABASE_CONNECTION = "DATABASE_CONNECTION_ERROR"

ERROR_DATABASE_TIMEOUT = "DATABASE_TIMEOUT"

ERROR_DUPLICATE_RECORD = "DUPLICATE_RECORD"

ERROR_FOREIGN_KEY = "FOREIGN_KEY_CONSTRAINT"

# ==========================================================
# CACHE ERRORS
# ==========================================================

ERROR_CACHE = "CACHE_ERROR"

ERROR_REDIS_CONNECTION = "REDIS_CONNECTION_ERROR"

# ==========================================================
# STORAGE ERRORS
# ==========================================================

ERROR_STORAGE = "STORAGE_ERROR"

ERROR_S3_UPLOAD = "S3_UPLOAD_FAILED"

ERROR_S3_DOWNLOAD = "S3_DOWNLOAD_FAILED"

# ==========================================================
# AI PROVIDERS
# ==========================================================

ERROR_OPENAI = "OPENAI_ERROR"

ERROR_ANTHROPIC = "ANTHROPIC_ERROR"

ERROR_GEMINI = "GEMINI_ERROR"

ERROR_GROK = "GROK_ERROR"

ERROR_RATE_LIMIT = "RATE_LIMIT_EXCEEDED"

ERROR_QUOTA_EXCEEDED = "QUOTA_EXCEEDED"

# ==========================================================
# NETWORK ERRORS
# ==========================================================

ERROR_HTTP = "HTTP_ERROR"

ERROR_NETWORK = "NETWORK_ERROR"

ERROR_CONNECTION = "CONNECTION_ERROR"

ERROR_GATEWAY_TIMEOUT = "GATEWAY_TIMEOUT"

# ==========================================================
# SUCCESS
# ==========================================================

SUCCESS = "SUCCESS"

CREATED = "CREATED"

UPDATED = "UPDATED"

DELETED = "DELETED"

# ==========================================================
# DEFAULT ERROR MESSAGES
# ==========================================================

DEFAULT_ERROR_MESSAGE = "Something went wrong."

DEFAULT_SUCCESS_MESSAGE = "Request completed successfully."

DEFAULT_NOT_FOUND_MESSAGE = "Requested resource was not found."

DEFAULT_UNAUTHORIZED_MESSAGE = "Authentication required."

DEFAULT_FORBIDDEN_MESSAGE = "Access denied."

DEFAULT_VALIDATION_MESSAGE = "Validation failed."

DEFAULT_INTERNAL_SERVER_MESSAGE = "Internal server error." 