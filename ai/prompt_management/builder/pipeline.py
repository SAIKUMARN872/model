from __future__ import annotations

from collections.abc import Callable, Mapping
from typing import Any

from ai.prompt_management.exceptions import PromptValidationError
from ai.prompt_management.builder.utils import validate_text


BuildStep = Callable[[dict[str, Any]], dict[str, Any]]


class PromptBuildPipeline:
    """Run prompt transformation steps in registration order."""

    def __init__(self) -> None:
        self._steps: list[BuildStep] = []

    def add_step(self, step: BuildStep) -> None:
        if not callable(step):
            raise PromptValidationError("Pipeline step must be callable.")
        self._steps.append(step)

    def run(self, initial: Mapping[str, Any]) -> dict[str, Any]:
        if not isinstance(initial, Mapping):
            raise PromptValidationError("Pipeline input must be a mapping.")

        state = dict(initial)

        for index, step in enumerate(self._steps, start=1):
            result = step(dict(state))
            if not isinstance(result, dict):
                raise PromptValidationError(
                    f"Pipeline step {index} must return a dictionary."
                )
            state = result

        if "prompt" in state:
            state["prompt"] = validate_text(state["prompt"], "prompt")

        return state

    @property
    def step_count(self) -> int:
        return len(self._steps)
