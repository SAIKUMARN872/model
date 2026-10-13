"""Planner agent integrated with ModelNow's agent foundation."""

from __future__ import annotations


import json
from typing import Any, Callable

from ..base.agent import BaseAgent
from ..models import AgentContext, AgentRequest
from .tasks import PlanTask, TaskPlan
from .utils import topological_sort
from .workflow import WorkflowExecutor


def build_plan(goal: str, steps: list[dict[str, Any]]) -> TaskPlan:
    """Build and validate a plan from explicit task definitions."""
    tasks = [
        PlanTask(
            task_id=step["task_id"],
            description=step["description"],
            dependencies=step.get("dependencies", []),
            metadata=step.get("metadata", {}),
        )
        for step in steps
    ]
    plan = TaskPlan(goal=goal, tasks=tasks)
    topological_sort(
        [task.task_id for task in tasks],
        {task.task_id: task.dependencies for task in tasks},
    )
    return plan


class PlannerAgent(BaseAgent):
    def __init__(
        self,
        agent_id: str = "planner-agent",
        task_executor: Callable[[PlanTask], Any] | None = None,
    ) -> None:
        super().__init__(agent_id=agent_id, name="Planner Agent")
        self.workflow = (
            WorkflowExecutor(task_executor) if task_executor is not None else None
        )

    async def execute(
        self, request: AgentRequest, context: AgentContext
    ) -> Any:
        raw_steps = request.metadata.get("steps")
        if raw_steps is None:
            raw_steps = context.metadata.get("steps")

        if not isinstance(raw_steps, list):
            raise ValueError(
                "Planning requires a list of task definitions in "
                "request.metadata['steps']."
            )

        plan = build_plan(request.input, raw_steps)
        should_execute = request.metadata.get(
            "execute", context.metadata.get("execute", False)
        )

        if should_execute:
            if self.workflow is None:
                raise ValueError(
                    "Execution was requested but no task_executor was configured."
                )
            plan = self.workflow.run(plan)

        result = {
            "goal": plan.goal,
            "tasks": [
                {
                    "task_id": task.task_id,
                    "description": task.description,
                    "dependencies": list(task.dependencies),
                    "status": task.status.value,
                    "result": task.result,
                    "error": task.error,
                }
                for task in plan.tasks
            ],
            "executed": bool(should_execute),
        }
        return json.dumps(result, ensure_ascii=False, default=str)



