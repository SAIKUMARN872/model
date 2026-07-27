"""
Authentication validators.

Provides validation rules for:
- User credentials
- Registration data
- Login requests
- Password policies
"""

from __future__ import annotations

import re

from fastapi import HTTPException, status



def validate_username(
    username: str,
) -> bool:
    """
    Validate username format.

    Rules:
    - 3 to 30 characters
    - Only letters, numbers, underscore
    """

    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is required.",
        )


    pattern = r"^[a-zA-Z0-9_]{3,30}$"


    if not re.match(
        pattern,
        username,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Username must contain only "
                "letters, numbers and underscore."
            ),
        )


    return True



def validate_email_format(
    email: str,
) -> bool:
    """
    Validate email format.
    """

    pattern = (
        r"^[a-zA-Z0-9._%+-]+@"
        r"[a-zA-Z0-9.-]+\."
        r"[a-zA-Z]{2,}$"
    )


    if not re.match(
        pattern,
        email,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address.",
        )


    return True



def validate_password_strength(
    password: str,
) -> bool:
    """
    Validate password policy.

    Rules:
    - Minimum 8 characters
    - One uppercase letter
    - One lowercase letter
    - One number
    - One special character
    """

    if len(password) < 8:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Password must contain "
                "at least 8 characters."
            ),
        )


    if not re.search(
        r"[A-Z]",
        password,
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Password must contain "
                "one uppercase letter."
            ),
        )


    if not re.search(
        r"[a-z]",
        password,
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Password must contain "
                "one lowercase letter."
            ),
        )


    if not re.search(
        r"\d",
        password,
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Password must contain "
                "one number."
            ),
        )


    if not re.search(
        r"[@$!%*?&#]",
        password,
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Password must contain "
                "one special character."
            ),
        )


    return True



def validate_login_credentials(
    email: str,
    password: str,
) -> bool:
    """
    Validate login input.
    """

    validate_email_format(
        email,
    )

    validate_password_strength(
        password,
    )

    return True



def validate_registration(
    username: str,
    email: str,
    password: str,
) -> bool:
    """
    Validate registration input.
    """

    validate_username(
        username,
    )

    validate_email_format(
        email,
    )

    validate_password_strength(
        password,
    )

    return True