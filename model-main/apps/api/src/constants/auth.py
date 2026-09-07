"""
Authentication Constants

Centralized authentication and authorization constants.
"""

from __future__ import annotations

# ==========================================================
# JWT
# ==========================================================

JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_TYPE = "access"

REFRESH_TOKEN_TYPE = "refresh"

# ==========================================================
# TOKEN EXPIRATION
# ==========================================================

ACCESS_TOKEN_EXPIRE_MINUTES = 30

REFRESH_TOKEN_EXPIRE_DAYS = 7

PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = 15

EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS = 24

# ==========================================================
# PASSWORD POLICY
# ==========================================================

PASSWORD_MIN_LENGTH = 8

PASSWORD_MAX_LENGTH = 128

PASSWORD_REQUIRE_UPPERCASE = True

PASSWORD_REQUIRE_LOWERCASE = True

PASSWORD_REQUIRE_DIGIT = True

PASSWORD_REQUIRE_SPECIAL_CHARACTER = True

# ==========================================================
# LOGIN
# ==========================================================

MAX_LOGIN_ATTEMPTS = 5

LOCKOUT_DURATION_MINUTES = 15

SESSION_TIMEOUT_MINUTES = 60

# ==========================================================
# USER ROLES
# ==========================================================

ROLE_SUPER_ADMIN = "super_admin"

ROLE_ADMIN = "admin"

ROLE_MANAGER = "manager"

ROLE_USER = "user"

ROLE_GUEST = "guest"

DEFAULT_ROLE = ROLE_USER

# ==========================================================
# USER STATUS
# ==========================================================

STATUS_ACTIVE = "active"

STATUS_INACTIVE = "inactive"

STATUS_PENDING = "pending"

STATUS_LOCKED = "locked"

STATUS_SUSPENDED = "suspended"

STATUS_DELETED = "deleted"

# ==========================================================
# AUTH HEADERS
# ==========================================================

AUTHORIZATION_HEADER = "Authorization"

BEARER_PREFIX = "Bearer"

API_KEY_HEADER = "X-API-Key"

REQUEST_ID_HEADER = "X-Request-ID"

# ==========================================================
# OAUTH PROVIDERS
# ==========================================================

GOOGLE_PROVIDER = "google"

GITHUB_PROVIDER = "github"

MICROSOFT_PROVIDER = "microsoft"

APPLE_PROVIDER = "apple"

# ==========================================================
# SCOPES
# ==========================================================

SCOPE_READ = "read"

SCOPE_WRITE = "write"

SCOPE_UPDATE = "update"

SCOPE_DELETE = "delete"

SCOPE_ADMIN = "admin"

# ==========================================================
# MFA
# ==========================================================

MFA_ISSUER = "ModelNow AI"

MFA_CODE_LENGTH = 6

MFA_TOKEN_EXPIRE_MINUTES = 5

# ==========================================================
# CACHE KEYS
# ==========================================================

ACCESS_TOKEN_CACHE_PREFIX = "access_token"

REFRESH_TOKEN_CACHE_PREFIX = "refresh_token"

USER_SESSION_PREFIX = "user_session"

BLACKLIST_TOKEN_PREFIX = "blacklist"

# ==========================================================
# COOKIE NAMES
# ==========================================================

ACCESS_COOKIE_NAME = "access_token"

REFRESH_COOKIE_NAME = "refresh_token"

SESSION_COOKIE_NAME = "session_id"