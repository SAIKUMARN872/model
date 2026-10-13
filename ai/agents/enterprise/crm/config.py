from dataclasses import dataclass


@dataclass(frozen=True)
class CRMConfig:
    domain: str = "crm"
    currency: str = "INR"
    default_country: str = "India"
    require_approval_before_booking: bool = True
    require_approval_before_payment: bool = True
    external_integrations_enabled: bool = False


DEFAULT_CRM_CONFIG = CRMConfig()
