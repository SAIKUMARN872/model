from __future__ import annotations

from .constants import EnterpriseDomain
from .exceptions import EnterpriseValidationError
from .models import EnterpriseTask


def validate_task_domain(task: EnterpriseTask, expected: EnterpriseDomain) -> None:
    if not isinstance(task, EnterpriseTask):
        raise EnterpriseValidationError("task must be an EnterpriseTask.")
    if task.domain != expected:
        raise EnterpriseValidationError(
            f"Task domain '{task.domain.value}' does not match "
            f"agent domain '{expected.value}'."
        )
