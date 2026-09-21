"""
Audit logger.

Provides centralized audit event logging for:
- User activities
- Authentication events
- API actions
- AI agent executions
- Security events
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from app.core.logging import logger



class AuditLogger:
    """
    Application audit logger.
    """

    def __init__(self) -> None:

        self.events: list[dict[str, Any]] = []



    async def log(
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
        Create audit event.

        Args:
            action:
                Action performed.

            user_id:
                User who performed action.

            resource:
                Resource affected.

            metadata:
                Additional event information.
        """

        event = {
            "id": str(uuid4()),

            "action": action,

            "user_id": str(user_id)
            if user_id
            else None,

            "organization_id": str(
                organization_id
            )
            if organization_id
            else None,

            "resource": resource,

            "resource_id": resource_id,

            "status": status,

            "ip_address": ip_address,

            "metadata": metadata or {},

            "timestamp": datetime.now(
                timezone.utc,
            ).isoformat(),
        }


        self.events.append(
            event,
        )


        logger.info(
            "Audit event created: %s",
            event,
        )


        return event



    async def success(
        self,
        action: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """
        Log successful action.
        """

        return await self.log(
            action=action,
            status="success",
            **kwargs,
        )



    async def failure(
        self,
        action: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """
        Log failed action.
        """

        return await self.log(
            action=action,
            status="failure",
            **kwargs,
        )



    def get_events(
        self,
    ) -> list[dict[str, Any]]:
        """
        Return audit events.

        In production this will query
        database/event store.
        """

        return self.events



# Global audit logger instance

audit_logger = AuditLogger()