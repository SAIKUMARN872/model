from dataclasses import dataclass


@dataclass(frozen=True)
class BusinessSupportConfig:
    domain: str = "business_support"
    default_priority: str = "medium"
    require_reason_for_escalation: bool = True
    external_integrations_enabled: bool = False


DEFAULT_BUSINESS_SUPPORT_CONFIG = BusinessSupportConfig()
