from __future__ import annotations

from typing import Protocol, runtime_checkable

from .models import EnterpriseTask


@runtime_checkable
class EnterpriseAgentProtocol(Protocol):
    agent_id: str
    domain: object

    async def run_task(self, task: EnterpriseTask) -> str:
        """Execute a domain-specific enterprise task and return text."""
