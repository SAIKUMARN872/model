"""SAP OData connector configuration."""
from dataclasses import dataclass
import re
from urllib.parse import urlsplit

from ai.connectors.exceptions import ConnectorConfigurationError

_NAME = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,99}$")
_ENV = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


@dataclass(frozen=True, slots=True)
class SAPEntityConfig:
    name: str
    entity_set: str
    key_field: str = "ID"
    required_permissions: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class SAPConfig:
    service_url: str
    allowed_hosts: tuple[str, ...]
    entities: tuple[SAPEntityConfig, ...]
    credential_env_var: str = "SAP_ACCESS_TOKEN"
    timeout_seconds: float = 20.0
    max_page_size: int = 100
    required_permissions: tuple[str, ...] = ("sap:read",)

    def __post_init__(self):
        try:
            parsed = urlsplit(self.service_url)
            valid = (
                parsed.scheme == "https"
                and bool(parsed.hostname)
                and not parsed.username
                and not parsed.password
                and not parsed.query
                and not parsed.fragment
                and parsed.hostname.lower() in {
                    host.lower() for host in self.allowed_hosts
                }
            )
        except (TypeError, ValueError):
            valid = False
        if not valid:
            raise ConnectorConfigurationError(
                "SAP service URL must use HTTPS and an explicitly allowlisted host."
            )
        if not self.allowed_hosts or any(
            not isinstance(host, str) or not host.strip()
            for host in self.allowed_hosts
        ):
            raise ConnectorConfigurationError("SAP allowed_hosts are required.")
        if not isinstance(self.credential_env_var, str) or not _ENV.fullmatch(
            self.credential_env_var
        ):
            raise ConnectorConfigurationError("Invalid credential environment variable.")
        if (
            isinstance(self.timeout_seconds, bool)
            or not isinstance(self.timeout_seconds, (int, float))
            or not 0 < self.timeout_seconds <= 120
        ):
            raise ConnectorConfigurationError("Invalid SAP timeout.")
        if (
            isinstance(self.max_page_size, bool)
            or not isinstance(self.max_page_size, int)
            or not 1 <= self.max_page_size <= 1000
        ):
            raise ConnectorConfigurationError("Invalid SAP maximum page size.")

        names = set()
        entity_sets = set()
        for entity in self.entities:
            if not isinstance(entity, SAPEntityConfig):
                raise ConnectorConfigurationError("Invalid SAP entity configuration.")
            if not isinstance(entity.name, str) or not _NAME.fullmatch(entity.name) or entity.name in names:
                raise ConnectorConfigurationError("SAP entity names must be unique and valid.")
            if not isinstance(entity.entity_set, str) or not _NAME.fullmatch(entity.entity_set):
                raise ConnectorConfigurationError("Invalid SAP entity set.")
            if not isinstance(entity.key_field, str) or not _NAME.fullmatch(entity.key_field):
                raise ConnectorConfigurationError("Invalid SAP entity key field.")
            if entity.entity_set in entity_sets:
                raise ConnectorConfigurationError("SAP entity sets must be unique.")
            names.add(entity.name)
            entity_sets.add(entity.entity_set)
