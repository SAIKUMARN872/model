"""
Audit module.

Provides high-level audit helpers for
tracking application activities, security
events, and AI operations.
"""

from __future__ import annotations

from typing import Any
from uuid import UUID

from app.audit.service import (
    audit_service,
)



async def audit_action(
    *,
    action: str,
    user_id: UUID | str | None = None,
    resource: str | None = None,
    resource_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Create general audit event.

    Example:
        USER_CREATED
        FILE_UPLOADED
        CHAT_COMPLETED
    """

    return await audit_service.create_audit_log(
        action=action,
        user_id=user_id,
        resource=resource,
        resource_id=resource_id,
        metadata=metadata,
    )



async def audit_login(
    *,
    user_id: UUID | str | None,
    success: bool,
    ip_address: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Audit authentication attempts.
    """

    return await audit_service.log_security_event(
        event=(
            "LOGIN_SUCCESS"
            if success
            else "LOGIN_FAILED"
        ),
        user_id=user_id,
        ip_address=ip_address,
        metadata=metadata,
    )



async def audit_permission_check(
    *,
    user_id: UUID | str,
    permission: str,
    allowed: bool,
) -> dict[str, Any]:
    """
    Audit authorization checks.
    """

    return await audit_service.create_audit_log(
        action=(
            "PERMISSION_GRANTED"
            if allowed
            else "PERMISSION_DENIED"
        ),
        user_id=user_id,
        resource="permission",
        metadata={
            "permission": permission,
        },
    )



async def audit_ai_request(
    *,
    user_id: UUID | str,
    model: str,
    action: str,
    tokens: int | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Audit AI model operations.

    Tracks:
    - Chat requests
    - Agent execution
    - LLM calls
    """

    return await audit_service.log_ai_activity(
        user_id=user_id,
        model=model,
        action=action,
        tokens=tokens,
        metadata=metadata,
    )



async def audit_file_operation(
    *,
    user_id: UUID | str,
    action: str,
    filename: str,
    file_id: str | None = None,
) -> dict[str, Any]:
    """
    Audit file operations.

    Examples:
    - FILE_UPLOAD
    - FILE_DELETE
    - FILE_DOWNLOAD
    """

    return await audit_service.create_audit_log(
        action=action,
        user_id=user_id,
        resource="file",
        resource_id=file_id,
        metadata={
            "filename": filename,
        },
    )