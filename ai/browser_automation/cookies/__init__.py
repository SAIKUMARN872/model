"""
Cookie management package.
"""

from .manager import (
    CookieManager,
)

from .security import (
    generate_encryption_key,
    hash_value,
    is_sensitive_cookie,
    mask_cookie_value,
    sanitize_cookie,
    sanitize_cookies,
    secure_compare,
)

from .storage import (
    CookieStorage,
    CookieStorageError,
)


__all__ = [
    "CookieManager",
    "CookieStorage",
    "CookieStorageError",
    "is_sensitive_cookie",
    "mask_cookie_value",
    "sanitize_cookie",
    "sanitize_cookies",
    "generate_encryption_key",
    "hash_value",
    "secure_compare",
]


__version__ = "1.0.0"