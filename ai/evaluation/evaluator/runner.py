"""
Evaluation runner.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any

from .evaluator import (
    EvaluationResult,
)
from .pipeline import (
    EvaluationPipeline,
    PipelineResult,
)


@dataclass
class RunnerConfig:
    """Evaluation runner configuration."""

    timeout: float | None = None

    fail_fast: bool = False


class EvaluationRunner:
    """Runs evaluation pipelines."""

    def __init__(
        self,
        config: RunnerConfig | None = None,
    ) -> None:

        self.config = (
            config
            or RunnerConfig()
        )

    async def run(
        self,
        pipeline: EvaluationPipeline,
    ) -> PipelineResult:

        operation = pipeline.run()

        if self.config.timeout is None:

            return await operation

        return await asyncio.wait_for(
            operation,
            timeout=self.config.timeout,
        )

    async def run_single(
        self,
        evaluator: Any,
        dataset: Any,
        predictor: Any,
        scorer: Any,
    ) -> EvaluationResult:

        operation = evaluator.evaluate(
            dataset,
            predictor,
            scorer,
        )

        if self.config.timeout is None:

            return await operation

        return await asyncio.wait_for(
            operation,
            timeout=self.config.timeout,
        )