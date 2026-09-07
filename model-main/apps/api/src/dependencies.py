"""
Application validators.

Exports all validation utilities used across
schemas, APIs, services, and domain layers.
"""

from .common import (
    validate_required,
    validate_length,
    validate_range,
)

from .email import (
    validate_email,
)

from .password import (
    validate_password,
)

from .uuid import (
    validate_uuid,
)

from .file import (
    validate_file_type,
    validate_file_size,
)

from .phone import (
    validate_phone_number,
)

from .url import (
    validate_url,
)

from .json import (
    validate_json,
)


__all__ = [
    # Common validators
    "validate_required",
    "validate_length",
    "validate_range",

    # Email
    "validate_email",

    # Password
    "validate_password",

    # UUID
    "validate_uuid",

    # File
    "validate_file_type",
    "validate_file_size",

    # Phone
    "validate_phone_number",

    # URL
    "validate_url",

    # JSON
    "validate_json",
]