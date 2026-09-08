"""
High-level execution runner for ModelNow.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from threading import RLock
from typing import Any, Callable

from .executor import (
    ExecutionConfig,
    ExecutionResult,
    TaskExecutor,
)
from .utils import (
    run_sync,
    safe_error,
    utc_now,
)


class RunnerError(Exception):
    """Base runner exception."""


class RunnerStoppedError(
    RunnerError
):
    """Raised when execution is attempted on a stopped runner."""


@dataclass
class Task:
    """
    Represents an executable task.
    """

    name: str

    function: Callable[..., Any]

    description: str = ""

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.name.strip():
            raise ValueError(
                "Task name cannot be empty"
            )

        if not callable(self.function):
            raise TypeError(
                "Task function must be callable"
            )


class ExecutionRunner:
    """
    High-level execution manager.

    Responsibilities:

        - register tasks
        - execute tasks
        - maintain execution history
        - stop/resume execution
    """

    def __init__(
        self,
        executor: TaskExecutor | None = None,
    ) -> None:

        self.executor = (
            executor
            or TaskExecutor()
        )

        self._tasks: dict[
            str,
            Task,
        ] = {}

        self._history: list[
            ExecutionResult
        ] = []

        self._running = True

        self._lock = RLock()

    @property
    def running(self) -> bool:

        with self._lock:
            return self._running

    def register(
        self,
        task: Task,
    ) -> None:

        if not isinstance(
            task,
            Task,
        ):
            raise TypeError(
                "task must be Task"
            )

        with self._lock:

            self._tasks[
                task.name
            ] = task

    def register_function(
        self,
        name: str,
        function: Callable[..., Any],
        description: str = "",
        metadata: dict[str, Any] | None = None,
    ) -> Task:

        task = Task(
            name=name,
            function=function,
            description=description,
            metadata=metadata or {},
        )

        self.register(
            task
        )

        return task

    def unregister(
        self,
        name: str,
    ) -> bool:

        with self._lock:

            if name not in self._tasks:
                return False

            del self._tasks[name]

            return True

    def get_task(
        self,
        name: str,
    ) -> Task:

        with self._lock:

            if name not in self._tasks:

                raise KeyError(
                    f"Task not registered: {name}"
                )

            return self._tasks[name]

    def list_tasks(
        self,
    ) -> list[str]:

        with self._lock:

            return sorted(
                self._tasks.keys()
            )

    async def run(
        self,
        name: str,
        *args: Any,
        **kwargs: Any,
    ) -> ExecutionResult:
        """
        Execute a registered task.
        """

        if not self.running:

            raise RunnerStoppedError(
                "Execution runner is stopped"
            )

        task = self.get_task(
            name
        )

        result = await self.executor.execute(
            task.function,
            *args,
            **kwargs,
        )

        result.metadata.update(
            task.metadata
        )

        with self._lock:

            self._history.append(
                result
            )

        return result

    def run_sync(
        self,
        name: str,
        *args: Any,
        **kwargs: Any,
    ) -> ExecutionResult:

        return run_sync(
            self.run(
                name,
                *args,
                **kwargs,
            )
        )

    async def run_function(
        self,
        function: Callable[..., Any],
        *args: Any,
        **kwargs: Any,
    ) -> ExecutionResult:

        if not self.running:

            raise RunnerStoppedError(
                "Execution runner is stopped"
            )

        result = await self.executor.execute(
            function,
            *args,
            **kwargs,
        )

        with self._lock:

            self._history.append(
                result
            )

        return result

    def stop(self) -> None:

        with self._lock:
            self._running = False

    def start(self) -> None:

        with self._lock:
            self._running = True

    def history(
        self,
    ) -> list[ExecutionResult]:

        with self._lock:

            return list(
                self._history
            )

    def last_result(
        self,
    ) -> ExecutionResult | None:

        with self._lock:

            if not self._history:
                return None

            return self._history[-1]

    def clear_history(self) -> None:

        with self._lock:
            self._history.clear()

    def status(self) -> dict[str, Any]:

        with self._lock:

            return {
                "running": self._running,
                "task_count": len(
                    self._tasks
                ),
                "tasks": sorted(
                    self._tasks.keys()
                ),
                "execution_count": len(
                    self._history
                ),
                "last_execution": (
                    self._history[-1].to_dict()
                    if self._history
                    else None
                ),
            }