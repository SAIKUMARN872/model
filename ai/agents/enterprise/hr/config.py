from dataclasses import dataclass


@dataclass(frozen=True)
class HRConfig:
    domain: str = "hr"
    require_approval_for_onboarding: bool = True
    require_approval_for_leave: bool = True
    external_integrations_enabled: bool = False


DEFAULT_HR_CONFIG = HRConfig()
