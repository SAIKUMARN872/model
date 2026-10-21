"""ServiceNow connector configuration."""
from dataclasses import dataclass
import re
from urllib.parse import urlsplit

from ai.connectors.exceptions import ConnectorConfigurationError

_NAME = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,79}$")
_ENV = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


@dataclass(frozen=True, slots=True)
class ServiceNowTableConfig:
    name: str
    table_name: str
    required_permissions: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class ServiceNowConfig:
    instance_url: str
    allowed_hosts: tuple[str, ...]
    tables: tuple[ServiceNowTableConfig, ...]
    credential_env_var: str = "SERVICENOW_ACCESS_TOKEN"
    timeout_seconds: float = 15.0
    max_page_size: int = 100
    required_permissions: tuple[str, ...] = ("servicenow:read",)

    def __post_init__(self):
        try:
            parsed = urlsplit(self.instance_url)
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
                and parsed.path in ("", "/")
            )
        except (TypeError, ValueError):
            valid = False
        if not valid:
            raise ConnectorConfigurationError(
                "ServiceNow instance URL must use HTTPS and an explicitly allowlisted host."
            )
        if not self.allowed_hosts or any(
            not isinstance(host, str) or not host.strip()
            for host in self.allowed_hosts
        ):
            raise ConnectorConfigurationError("ServiceNow allowed_hosts are required.")
        if not isinstance(self.credential_env_var, str) or not _ENV.fullmatch(
            self.credential_env_var
        ):
            raise ConnectorConfigurationError("Invalid credential environment variable.")
        if (
            isinstance(self.timeout_seconds, bool)
            or not isinstance(self.timeout_seconds, (int, float))
            or not 0 < self.timeout_seconds <= 120
        ):
            raise ConnectorConfigurationError("Invalid ServiceNow timeout.")
        if (
            isinstance(self.max_page_size, bool)
            or not isinstance(self.max_page_size, int)
            or not 1 <= self.max_page_size <= 1000
        ):
            raise ConnectorConfigurationError("Invalid ServiceNow page size.")

        names, tables = set(), set()
        for table in self.tables:
            if not isinstance(table, ServiceNowTableConfig):
                raise ConnectorConfigurationError("Invalid ServiceNow table configuration.")
            if (
                not isinstance(table.name, str)
                or not _NAME.fullmatch(table.name)
                or table.name in names
            ):
                raise ConnectorConfigurationError("ServiceNow table aliases must be unique and valid.")
            if (
                not isinstance(table.table_name, str)
                or not _NAME.fullmatch(table.table_name)
                or table.table_name in tables
            ):
                raise ConnectorConfigurationError("ServiceNow table names must be unique and valid.")
            names.add(table.name)
            tables.add(table.table_name)
