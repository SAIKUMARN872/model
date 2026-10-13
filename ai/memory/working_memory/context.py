from __future__ import annotations

from dataclasses import dataclass, field

from .utils import validate_identifier, validate_metadata, validate_optional_identifier


@dataclass(frozen=True, slots=True)
class WorkingMemoryContext:
    tenant_id: str
    user_id: str
    conversation_id: str | None = None
    task_id: str | None = None
    metadata: dict = field(default_factory=dict)

    def __post_init__(self) -> None:
        object.__setattr__(
            self, "tenant_id", validate_identifier(self.tenant_id, "tenant_id")
        )
        object.__setattr__(
            self, "user_id", validate_identifier(self.user_id, "user_id")
        )
        object.__setattr__(
            self,
            "conversation_id",
            validate_optional_identifier(self.conversation_id, "conversation_id"),
        )
        object.__setattr__(
            self, "task_id", validate_optional_identifier(self.task_id, "task_id")
        )
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))

    @property
    def scope_key(self) -> tuple[str, str, str | None, str | None]:
        return (
            self.tenant_id,
            self.user_id,
            self.conversation_id,
            self.task_id,
        )
