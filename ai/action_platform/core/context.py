from dataclasses import dataclass, field


@dataclass
class ActionContext:
    """Execution identity and approval context supplied by a trusted caller."""
    user_id: str | None = None
    permissions: set[str] = field(default_factory=set)
    approved_actions: set[str] = field(default_factory=set)
    metadata: dict[str, str] = field(default_factory=dict)

    def has_permission(self, permission: str) -> bool:
        return permission in self.permissions

    def has_approval(self, action_id: str) -> bool:
        return action_id in self.approved_actions
