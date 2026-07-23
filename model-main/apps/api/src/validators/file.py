"""
File validators.

Provides validation utilities for uploaded files:
- File type validation
- File size validation
- Filename validation
- Extension validation
"""

from __future__ import annotations

import os
import re
from typing import Iterable

from fastapi import HTTPException, status



def validate_file_size(
    size: int,
    max_size: int,
) -> bool:
    """
    Validate file size.

    Args:
        size:
            File size in bytes.

        max_size:
            Maximum allowed size in bytes.
    """

    if size <= 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File cannot be empty.",
        )


    if size > max_size:

        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File size exceeds limit "
                f"of {max_size} bytes."
            ),
        )


    return True



def validate_file_type(
    content_type: str | None,
    allowed_types: Iterable[str],
) -> bool:
    """
    Validate MIME type.

    Example:
        application/pdf
        image/png
    """

    if not content_type:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content type is required.",
        )


    if content_type not in allowed_types:

        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"File type '{content_type}' "
                "is not supported."
            ),
        )


    return True



def validate_extension(
    filename: str,
    allowed_extensions: Iterable[str],
) -> bool:
    """
    Validate file extension.
    """

    extension = (
        os.path.splitext(filename)[1]
        .lower()
        .replace(".", "")
    )


    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"File extension '.{extension}' "
                "is not allowed."
            ),
        )


    return True



def validate_filename(
    filename: str,
) -> bool:
    """
    Validate filename security.

    Prevents:
    - Empty filenames
    - Path traversal attacks
    """

    if not filename:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required.",
        )


    if ".." in filename or "/" in filename:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename.",
        )


    return True



def sanitize_filename(
    filename: str,
) -> str:
    """
    Remove unsafe characters from filename.
    """

    filename = filename.strip()


    filename = re.sub(
        r"[^a-zA-Z0-9._-]",
        "_",
        filename,
    )


    return filename



def validate_document_file(
    filename: str,
    content_type: str | None,
    size: int,
) -> bool:
    """
    Validate common document uploads.

    Supports:
    - PDF
    - DOCX
    - TXT
    """

    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ]


    allowed_extensions = [
        "pdf",
        "docx",
        "txt",
    ]


    validate_filename(
        filename,
    )


    validate_file_type(
        content_type,
        allowed_types,
    )


    validate_extension(
        filename,
        allowed_extensions,
    )


    validate_file_size(
        size,
        max_size=10 * 1024 * 1024,
    )


    return True