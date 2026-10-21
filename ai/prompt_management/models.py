from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from ai.prompt_management.constants import PromptStatus
from ai.prompt_management.exceptions import PromptValidationError


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass(frozen=True, slots=True)
class PromptVariable:
    name: str
    required: bool = True
    default: str | None = None
    description: str = ""

    def __post_init__(self) -> None:
        if not self.name.isidentifier():
            raise PromptValidationError(
                f"Invalid prompt variable name: {self.name!r}"
            )
        if self.default is not None and not isinstance(self.default, str):
            raise PromptValidationError("Variable defaults must be strings.")
        if self.required and self.default is not None:
            raise PromptValidationError(
                "A required variable cannot have a default value."
            )


@dataclass(frozen=True, slots=True)
class PromptVersion:
    version: int
    template: str
    created_at: datetime = field(default_factory=utc_now)
    published_at: datetime | None = None
    changelog: str = ""


@dataclass(frozen=True, slots=True)
class PromptDefinition:
    tenant_id: str
    name: str
    template: str
    prompt_id: str = field(default_factory=lambda: str(uuid4()))
    description: str = ""
    variables: tuple[PromptVariable, ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)
    status: PromptStatus = PromptStatus.DRAFT
    version: int = 1
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)
    published_version: int | None = None
    versions: tuple[PromptVersion, ...] = ()

    def __post_init__(self) -> None:
        if not isinstance(self.tenant_id, str) or not self.tenant_id.strip():
            raise PromptValidationError("tenant_id is required.")
        if not isinstance(self.name, str) or not self.name.strip():
            raise PromptValidationError("Prompt name is required.")
        if len(self.name) > 128:
            raise PromptValidationError("Prompt name exceeds 128 characters.")
        if not isinstance(self.template, str) or not self.template.strip():
            raise PromptValidationError("Prompt template cannot be empty.")
        if len(self.template) > 50_000:
            raise PromptValidationError("Prompt template exceeds 50000 characters.")
        if len(self.variables) > 100:
            raise PromptValidationError("A prompt can define at most 100 variables.")
        names = [variable.name for variable in self.variables]
        if len(names) != len(set(names)):
            raise PromptValidationError("Prompt variable names must be unique.")
        if self.version < 1:
            raise PromptValidationError("Prompt version must be positive.")
        object.__setattr__(self, "metadata", dict(self.metadata))
