from __future__ import annotations

from ai.agents.constants import AgentStatus
from ai.agents.models import AgentContext, AgentRequest

from .audit import (
    EnterpriseAuditLog,
    InMemoryEnterpriseAuditLog,
    make_audit_event,
)
from .constants import EnterpriseDomain, EnterpriseTaskStatus
from .exceptions import (
    EnterpriseAuditError,
    EnterprisePermissionError,
    EnterpriseRoutingError,
    EnterpriseValidationError,
)
from .models import EnterpriseTask
from .registry import EnterpriseAgentRegistry


class EnterpriseRouter:
    """Route enterprise tasks with explicit audit-failure handling."""

    def __init__(
        self,
        registry: EnterpriseAgentRegistry,
        audit_log: EnterpriseAuditLog | None = None,
    ) -> None:
        if not isinstance(registry, EnterpriseAgentRegistry):
            raise EnterpriseValidationError(
                "registry must be an EnterpriseAgentRegistry."
            )
        if audit_log is not None and not callable(
            getattr(audit_log, "record", None)
        ):
            raise EnterpriseValidationError(
                "audit_log must provide a record(event) method."
            )
        self.registry = registry
        self.audit_log = (
            audit_log if audit_log is not None else InMemoryEnterpriseAuditLog()
        )

    def _audit(
        self,
        task: EnterpriseTask,
        status: EnterpriseTaskStatus,
        actor_id: str | None = None,
        error_type: str | None = None,
    ) -> None:
        event = make_audit_event(
            task_id=task.task_id,
            domain=task.domain,
            action=task.action,
            status=status,
            actor_id=actor_id,
            error_type=error_type,
        )
        try:
            self.audit_log.record(event)
        except Exception as exc:
            raise EnterpriseAuditError(
                f"Could not record audit status '{status.value}' "
                f"for task '{task.task_id}'."
            ) from exc

    def _record_failure(
        self,
        task: EnterpriseTask,
        actor_id: str | None,
        original_error: Exception,
        *,
        execution_started: bool,
    ) -> None:
        try:
            self._audit(
                task,
                EnterpriseTaskStatus.FAILED,
                actor_id,
                error_type=type(original_error).__name__,
            )
        except EnterpriseAuditError as audit_exc:
            if execution_started:
                message = (
                    f"Task '{task.task_id}' encountered an error and its "
                    "failure audit could not be recorded. The operation's "
                    "outcome may require reconciliation; do not blindly retry."
                )
            else:
                message = (
                    f"Task '{task.task_id}' failed before agent execution, "
                    "and its failure audit could not be recorded."
                )
            raise EnterpriseAuditError(message) from audit_exc

    @staticmethod
    def _raise_routing_error(
        task: EnterpriseTask, exc: Exception
    ) -> None:
        if isinstance(exc, (EnterprisePermissionError, EnterpriseRoutingError)):
            raise exc

        raise EnterpriseRoutingError(
            f"Could not route task '{task.task_id}' to "
            f"'{task.domain.value}': {exc}"
        ) from exc

    async def route(
        self,
        task: EnterpriseTask,
        context: AgentContext | None = None,
    ) -> str:
        if not isinstance(task, EnterpriseTask):
            raise EnterpriseRoutingError("task must be an EnterpriseTask.")

        if context is not None and not isinstance(context, AgentContext):
            raise EnterpriseRoutingError(
                "context must be an AgentContext or None."
            )

        actor_id = context.user_id if context is not None else None

        # Fail closed: no agent work starts unless PENDING is recorded.
        self._audit(task, EnterpriseTaskStatus.PENDING, actor_id)

        try:
            agent = self.registry.get(task.domain)

            if agent.domain != task.domain:
                raise EnterpriseRoutingError(
                    f"Agent domain '{agent.domain.value}' does not match "
                    f"task domain '{task.domain.value}'."
                )

            if context is not None:
                required_permission = (
                    f"enterprise:{task.domain.value}:{task.action}"
                )
                wildcard_permission = f"enterprise:{task.domain.value}:*"

                if (
                    required_permission not in context.permissions
                    and wildcard_permission not in context.permissions
                ):
                    raise EnterprisePermissionError(
                        f"Missing permission '{required_permission}'."
                    )
        except Exception as exc:
            self._record_failure(
                task, actor_id, exc, execution_started=False
            )
            self._raise_routing_error(task, exc)

        # If RUNNING cannot be recorded, execution must not start.
        self._audit(task, EnterpriseTaskStatus.RUNNING, actor_id)

        try:
            if context is None:
                result = await agent.run_task(task)
                if not isinstance(result, str):
                    raise EnterpriseRoutingError(
                        "Enterprise agent must return a string."
                    )
            else:
                request = AgentRequest(
                    input=task.action,
                    context=context,
                    task_id=task.task_id,
                    metadata={"enterprise_task": task},
                )
                response = await agent.run(request)

                if response.status != AgentStatus.COMPLETED:
                    raise EnterpriseRoutingError(
                        f"Agent '{agent.agent_id}' failed task "
                        f"'{task.task_id}': "
                        f"{response.error or response.status.value}"
                    )
                result = response.output
        except Exception as exc:
            self._record_failure(
                task, actor_id, exc, execution_started=True
            )
            self._raise_routing_error(task, exc)

        # The operation may already have succeeded. Never turn this into a
        # FAILED event or automatically repeat the operation if this write fails.
        self._audit(task, EnterpriseTaskStatus.COMPLETED, actor_id)
        return result
