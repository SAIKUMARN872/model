from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4

from ai.agents.base.agent import BaseAgent
from ai.agents.constants import AgentStatus
from ai.agents.engine import AgentEngine
from ai.agents.models import AgentContext, AgentRequest

from .audit import EnterpriseAuditLog
from .business_support.agent import BusinessSupportAgent
from .constants import EnterpriseDomain
from .crm.agent import CRMAgent
from .custom.agent import CustomEnterpriseAgent
from .erp.agent import ERPAgent
from .exceptions import EnterpriseRoutingError
from .finance.agent import FinanceAgent
from .hr.agent import HRAgent
from .models import EnterpriseTask
from .registry import EnterpriseAgentRegistry
from .router import EnterpriseRouter
from .sales.agent import SalesAgent


class EnterpriseRouterGateway(BaseAgent):
    """Expose one enterprise domain through the central AgentEngine."""

    def __init__(
        self,
        domain: EnterpriseDomain,
        router: EnterpriseRouter,
    ) -> None:
        if not isinstance(domain, EnterpriseDomain):
            raise ValueError("domain must be an EnterpriseDomain")
        if not isinstance(router, EnterpriseRouter):
            raise ValueError("router must be an EnterpriseRouter")

        self.domain = domain
        self.router = router

        super().__init__(
            agent_id=f"enterprise-gateway-{domain.value}",
            name=f"{domain.value.replace('_', ' ').title()} Gateway",
        )

    async def execute(
        self,
        request: AgentRequest,
        context: AgentContext,
    ) -> str:
        supplied_task = request.metadata.get("enterprise_task")

        if isinstance(supplied_task, EnterpriseTask):
            task = supplied_task
        elif isinstance(supplied_task, dict):
            try:
                task_domain = EnterpriseDomain(
                    supplied_task.get("domain", self.domain.value)
                )
                task = EnterpriseTask(
                    task_id=(
                        supplied_task.get("task_id")
                        or request.task_id
                        or f"enterprise-{uuid4().hex}"
                    ),
                    domain=task_domain,
                    action=supplied_task.get("action", request.input),
                    payload=supplied_task.get(
                        "payload",
                        request.metadata.get("payload", {}),
                    ),
                    metadata=supplied_task.get("metadata", {}),
                )
            except (TypeError, ValueError) as exc:
                raise EnterpriseRoutingError(
                    f"Invalid enterprise task: {exc}"
                ) from exc
        else:
            task = EnterpriseTask(
                task_id=request.task_id or f"enterprise-{uuid4().hex}",
                domain=self.domain,
                action=request.input,
                payload=request.metadata.get("payload", {}),
            )

        if task.domain != self.domain:
            raise EnterpriseRoutingError(
                f"Gateway '{self.domain.value}' cannot execute "
                f"domain '{task.domain.value}'."
            )

        return await self.router.route(task, context)


@dataclass(frozen=True)
class EnterpriseAgentPlatform:
    """Connected enterprise registry, router, and central agent engine."""

    engine: AgentEngine
    registry: EnterpriseAgentRegistry
    router: EnterpriseRouter

    def execute(
        self,
        domain: EnterpriseDomain | str,
        request: AgentRequest,
    ):
        """Execute through the central engine and enterprise router."""
        try:
            resolved_domain = (
                domain
                if isinstance(domain, EnterpriseDomain)
                else EnterpriseDomain(domain)
            )
        except (ValueError, TypeError) as exc:
            raise ValueError(f"Unknown enterprise domain: {domain}") from exc

        gateway_id = f"enterprise-gateway-{resolved_domain.value}"
        return self.engine.execute(gateway_id, request)


def create_enterprise_platform(
    *,
    audit_log: EnterpriseAuditLog | None = None,
) -> EnterpriseAgentPlatform:
    """Register all seven departments and connect them to AgentEngine."""

    registry = EnterpriseAgentRegistry()

    departments: tuple[BaseAgent, ...] = (
        BusinessSupportAgent(),
        CRMAgent(),
        CustomEnterpriseAgent(),
        ERPAgent(),
        FinanceAgent(),
        HRAgent(),
        SalesAgent(),
    )

    for agent in departments:
        registry.register(agent)

    router = EnterpriseRouter(registry, audit_log=audit_log)
    engine = AgentEngine()

    for domain in EnterpriseDomain:
        engine.register(EnterpriseRouterGateway(domain, router))

    return EnterpriseAgentPlatform(
        engine=engine,
        registry=registry,
        router=router,
    )


__all__ = [
    "EnterpriseAgentPlatform",
    "EnterpriseRouterGateway",
    "create_enterprise_platform",
]
