"""
High-level automation runner.
"""

from __future__ import annotations

from typing import Any

from .executor import (
    ExecutionResult,
    ExecutionTask,
    TaskExecutor,
)


class AutomationRunner:
    """
    Runs browser automation actions through
    TaskExecutor.
    """

    def __init__(
        self,
        executor: TaskExecutor | None = None,
    ) -> None:

        self.executor = (
            executor
            or TaskExecutor()
        )

    async def run(
        self,
        task_id: str,
        action,
        name: str = "automation",
        timeout: float | None = None,
        retries: int = 0,
        metadata: dict[str, Any] | None = None,
    ) -> ExecutionResult:

        task = ExecutionTask(
            action=action,
            task_id=task_id,
            name=name,
            timeout=timeout,
            retries=retries,
            metadata=metadata or {},
        )

        return await self.executor.submit(
            task
        )

    async def run_sequence(
        self,
        tasks: list[ExecutionTask],
    ) -> list[ExecutionResult]:

        results = []

        for task in tasks:

            result = await self.executor.execute(
                task
            )

            results.append(
                result
            )

            if not result.success:
                break

        return results

    async def run_parallel(
        self,
        tasks: list[ExecutionTask],
    ) -> list[ExecutionResult]:

        return await self.executor.execute_many(
            tasks
        )