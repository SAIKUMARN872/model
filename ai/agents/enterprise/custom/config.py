from dataclasses import dataclass


@dataclass(frozen=True)
class CustomAgentConfig:
    max_workflow_steps: int = 50
    require_approval_for_sensitive_actions: bool = True


DEFAULT_CUSTOM_AGENT_CONFIG = CustomAgentConfig()
