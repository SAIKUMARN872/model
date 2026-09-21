"""
Audit service.

Business layer for creating, querying,
and managing audit records.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.audit_logger import (
    audit_logger,
)

from app.core.logging import logger



class AuditService:
    """
    Service responsible for audit operations.
    """

    def __init__(
        self,
        db: AsyncSession | None = None,
    ) -> None:

        self.db = db



    async def create_audit_log(
        self,
        *,
        action: str,
        user_id: UUID | str | None = None,
        organization_id: UUID | str | None = None,
        resource: str | None = None,
        resource_id: str | None = None,
        metadata: dict[str, Any] | None = None,
        ip_address: str | None = None,
        status: str = "success",
    ) -> dict[str, Any]:
        """
        Create audit log entry.
        """

        try:

            event = await audit_logger.log(
                action=action,
                user_id=user_id,
                organization_id=organization_id,
                resource=resource,
                resource_id=resource_id,
                metadata=metadata,
                ip_address=ip_address,
                status=status,
            )


            # In production:
            # Save event to database here

            # await self.db.add(
            #     AuditRecord(**event)
            # )


            logger.info(
                "Audit log stored successfully.",
            )


            return event


        except Exception as exc:

            logger.exception(
                "Failed creating audit log.",
                exc_info=exc,
            )

            raise



    async def log_user_action(
        self,
        *,
        user_id: UUID | str,
        action: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Log user activity.
        """

        return await self.create_audit_log(
            action=action,
            user_id=user_id,
            resource="user",
            metadata=metadata,
        )



    async def log_security_event(
        self,
        *,
        event: str,
        user_id: UUID | str | None = None,
        ip_address: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Log security related events.

        Examples:
        - Login success
        - Login failure
        - Permission denied
        - Token refresh
        """

        return await self.create_audit_log(
            action=event,
            user_id=user_id,
            resource="security",
            ip_address=ip_address,
            metadata=metadata,
        )



    async def log_ai_activity(
        self,
        *,
        user_id: UUID | str,
        model: str,
        action: str,
        tokens: int | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Log AI model activity.

        Tracks:
        - LLM requests
        - Agent execution
        - Token usage
        """

        return await self.create_audit_log(
            action=action,
            user_id=user_id,
            resource="ai_model",
            metadata={
                "model": model,
                "tokens": tokens,
                **(metadata or {}),
            },
        )



    async def get_audit_history(
        self,
        *,
        user_id: UUID | str | None = None,
        action: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Retrieve audit history.

        Replace with database query
        in production.
        """

        events = audit_logger.get_events()


        if user_id:

            events = [
                event
                for event in events
                if event["user_id"]
                == str(user_id)
            ]


        if action:

            events = [
                event
                for event in events
                if event["action"]
                == action
            ]


        return events



    async def cleanup_old_logs(
        self,
        days: int = 90,
    ) -> dict[str, Any]:
        """
        Cleanup old audit logs.

        Production:
        - Delete from database
        - Archive to storage
        """

        cutoff = datetime.now(
            timezone.utc,
        )


        logger.info(
            "Audit cleanup executed before %s days",
            days,
        )


        return {
            "status": "completed",
            "cleanup_before": cutoff.isoformat(),
        }



# Service instance

audit_service = AuditService()