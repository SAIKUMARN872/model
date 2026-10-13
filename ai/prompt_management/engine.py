from __future__ import annotations

import re
from dataclasses import replace
from datetime import datetime, timezone
from threading import RLock
from typing import Any

from ai.prompt_management.constants import PromptStatus
from ai.prompt_management.exceptions import (
    MissingPromptVariablesError,
    PromptConflictError,
    PromptNotFoundError,
    PromptValidationError,
)
from ai.prompt_management.models import (
    PromptDefinition,
    PromptVariable,
    PromptVersion,
)
from ai.prompt_management.schemas import CreatePromptRequest


_VARIABLE_PATTERN = re.compile(r"{{\s*([A-Za-z_][A-Za-z0-9_]*)\s*}}")


class InMemoryPromptRegistry:
    """Thread-safe registry scoped by tenant and prompt ID."""

    def __init__(self) -> None:
        self._prompts: dict[tuple[str, str], PromptDefinition] = {}
        self._lock = RLock()

    def create(self, prompt: PromptDefinition) -> PromptDefinition:
        key = (prompt.tenant_id, prompt.prompt_id)
        with self._lock:
            if key in self._prompts:
                raise PromptConflictError("Prompt ID already exists.")
            if any(
                p.tenant_id == prompt.tenant_id and p.name == prompt.name
                for p in self._prompts.values()
            ):
                raise PromptConflictError(
                    "A prompt with this name already exists in the tenant."
                )
            self._prompts[key] = prompt
            return prompt

    def get(self, tenant_id: str, prompt_id: str) -> PromptDefinition:
        with self._lock:
            prompt = self._prompts.get((tenant_id, prompt_id))
            if prompt is None:
                raise PromptNotFoundError(
                    "Prompt was not found in the requested tenant."
                )
            return prompt

    def save(self, prompt: PromptDefinition) -> PromptDefinition:
        key = (prompt.tenant_id, prompt.prompt_id)
        with self._lock:
            if key not in self._prompts:
                raise PromptNotFoundError(
                    "Prompt was not found in the requested tenant."
                )
            self._prompts[key] = prompt
            return prompt

    def list(self, tenant_id: str) -> list[PromptDefinition]:
        with self._lock:
            return sorted(
                (p for p in self._prompts.values() if p.tenant_id == tenant_id),
                key=lambda p: p.name.casefold(),
            )


class PromptManagementEngine:
    """Prompt lifecycle and safe, non-evaluating template substitution."""

    def __init__(self, registry: InMemoryPromptRegistry | None = None) -> None:
        self.registry = registry or InMemoryPromptRegistry()

    @staticmethod
    def _validate_template(template: str, variables: tuple[PromptVariable, ...]) -> None:
        declared = {item.name for item in variables}
        referenced = set(_VARIABLE_PATTERN.findall(template))
        unknown = referenced - declared
        if unknown:
            raise PromptValidationError(
                "Template references undeclared variables: "
                + ", ".join(sorted(unknown))
            )

    def create(self, request: CreatePromptRequest) -> PromptDefinition:
        if not request.tenant_id.strip():
            raise PromptValidationError("tenant_id is required.")
        self._validate_template(request.template, request.variables)
        prompt = PromptDefinition(
            tenant_id=request.tenant_id,
            name=request.name.strip(),
            template=request.template,
            description=request.description,
            variables=tuple(request.variables),
            metadata=request.metadata,
        )
        return self.registry.create(prompt)

    def get(self, tenant_id: str, prompt_id: str) -> PromptDefinition:
        return self.registry.get(tenant_id, prompt_id)

    def list(self, tenant_id: str) -> list[PromptDefinition]:
        return self.registry.list(tenant_id)

    def update_draft(
        self,
        tenant_id: str,
        prompt_id: str,
        *,
        template: str,
        variables: tuple[PromptVariable, ...] | None = None,
        description: str | None = None,
    ) -> PromptDefinition:
        current = self.get(tenant_id, prompt_id)
        if current.status == PromptStatus.ARCHIVED:
            raise PromptConflictError("Archived prompts cannot be edited.")
        if current.status == PromptStatus.PUBLISHED:
            raise PromptConflictError(
                "Published prompts are immutable; create a new draft/version."
            )
        new_variables = current.variables if variables is None else tuple(variables)
        self._validate_template(template, new_variables)
        updated = replace(
            current,
            template=template,
            variables=new_variables,
            description=current.description if description is None else description,
            version=current.version + 1,
            updated_at=datetime.now(timezone.utc),
        )
        return self.registry.save(updated)

    def publish(
        self, tenant_id: str, prompt_id: str, changelog: str = ""
    ) -> PromptDefinition:
        current = self.get(tenant_id, prompt_id)
        if current.status == PromptStatus.ARCHIVED:
            raise PromptConflictError("Archived prompts cannot be published.")
        if current.status == PromptStatus.PUBLISHED:
            raise PromptConflictError("This prompt version is already published.")
        self._validate_template(current.template, current.variables)
        now = datetime.now(timezone.utc)
        snapshot = PromptVersion(
            version=current.version,
            template=current.template,
            created_at=current.updated_at,
            published_at=now,
            changelog=changelog,
        )
        updated = replace(
            current,
            status=PromptStatus.PUBLISHED,
            published_version=current.version,
            versions=current.versions + (snapshot,),
            updated_at=now,
        )
        return self.registry.save(updated)

    def render(
        self,
        tenant_id: str,
        prompt_id: str,
        values: dict[str, Any] | None = None,
        version: int | None = None,
    ) -> str:
        prompt = self.get(tenant_id, prompt_id)
        values = {} if values is None else dict(values)

        if prompt.status == PromptStatus.ARCHIVED:
            raise PromptConflictError("Archived prompts cannot be rendered.")

        if version is not None:
            matches = [item for item in prompt.versions if item.version == version]
            if not matches:
                raise PromptNotFoundError("Published prompt version was not found.")
            template = matches[0].template
            variables = prompt.variables
        elif prompt.status == PromptStatus.PUBLISHED:
            matches = [
                item for item in prompt.versions
                if item.version == prompt.published_version
            ]
            if not matches:
                raise PromptConflictError("Published version snapshot is missing.")
            template = matches[0].template
            variables = prompt.variables
        else:
            template = prompt.template
            variables = prompt.variables

        declared = {item.name: item for item in variables}
        unknown_values = set(values) - set(declared)
        if unknown_values:
            raise PromptValidationError(
                "Undeclared input variables: " + ", ".join(sorted(unknown_values))
            )

        resolved: dict[str, str] = {}
        missing: list[str] = []
        for name, definition in declared.items():
            if name in values:
                value = values[name]
                if not isinstance(value, (str, int, float, bool)):
                    raise PromptValidationError(
                        f"Variable {name!r} must be a scalar value."
                    )
                resolved[name] = str(value)
            elif definition.default is not None:
                resolved[name] = definition.default
            elif definition.required:
                missing.append(name)
            else:
                resolved[name] = ""

        if missing:
            raise MissingPromptVariablesError(missing)

        return _VARIABLE_PATTERN.sub(
            lambda match: resolved[match.group(1)], template
        )

    def archive(self, tenant_id: str, prompt_id: str) -> PromptDefinition:
        current = self.get(tenant_id, prompt_id)
        if current.status == PromptStatus.ARCHIVED:
            return current
        updated = replace(
            current,
            status=PromptStatus.ARCHIVED,
            updated_at=datetime.now(timezone.utc),
        )
        return self.registry.save(updated)
