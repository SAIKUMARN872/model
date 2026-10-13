from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ai.prompt_management.models import PromptVariable


@dataclass(frozen=True, slots=True)
class CreatePromptRequest:
    tenant_id: str
    name: str
    template: str
    description: str = ""
    variables: tuple[PromptVariable, ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class RenderPromptRequest:
    tenant_id: str
    prompt_id: str
    variables: dict[str, Any] = field(default_factory=dict)
    version: int | None = None


@dataclass(frozen=True, slots=True)
class PublishPromptRequest:
    tenant_id: str
    prompt_id: str
    changelog: str = ""
