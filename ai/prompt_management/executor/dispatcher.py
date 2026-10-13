from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from ai.prompt_management.exceptions import PromptValidationError
from ai.prompt_management.executor.executor import (
    ExecutionRequest,
    ExecutionResult,
    PromptExecutor,
)


class PromptExecutionDispatcher:
    """Dispatch requests to explicitly registered execution handlers."""

    def __init__(self) -> None:
        self._executors: dict[str, PromptExecutor] = {}

    def register(self, name: str, executor: PromptExecutor) -> None:
        if not isinstance(name, str) or not name.strip():
            raise PromptValidationError("Executor name is required.")
        if not isinstance(executor, PromptExecutor):
            raise PromptValidationError(
                "Registered executor must be a PromptExecutor."
            )
        key = name.strip()
        if key in self._executors:
            raise PromptValidationError(
                f"Executor {key!r} is already registered."
            )
        self._executors[key] = executor

    def dispatch(
        self,
        name: str,
        request: ExecutionRequest,
    ) -> ExecutionResult:
        executor = self._executors.get(name)
        if executor is None:
            raise PromptValidationError(
                f"No executor registered under {name!r}."
            )
        return executor.execute(request)

    @property
    def registered_names(self) -> tuple[str, ...]:
        return tuple(sorted(self._executors))
