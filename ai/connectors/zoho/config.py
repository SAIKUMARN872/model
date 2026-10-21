"""Configuration for the generic Zoho connector."""
from dataclasses import dataclass
import re
from urllib.parse import urlsplit

from ai.connectors.exceptions import ConnectorConfigurationError

_NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_]{0,63}$")
_ENV = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


@dataclass(frozen=True, slots=True)
class ZohoOperation:
    """A statically configured, read-only API operation."""
    name: str
    path: str
    query_parameters: tuple[str, ...] = ()
    required_permissions: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class ZohoConfig:
    """Configure a Zoho regional API URL and permitted operations."""
    base_url: str = "https://www.zohoapis.com"
    allowed_hosts: tuple[str, ...] = ("www.zohoapis.com",)
    credential_env_var: str = "ZOHO_ACCESS_TOKEN"
    timeout_seconds: float = 15.0
    operations: tuple[ZohoOperation, ...] = ()
    required_permissions: tuple[str, ...] = ("zoho:read",)
    version: str = "1.0.0"

    def __post_init__(self):
        parsed = urlsplit(self.base_url) if isinstance(self.base_url, str) else None
        host = (parsed.hostname or "").lower().rstrip(".") if parsed else ""
        if (
            not parsed or parsed.scheme != "https" or not host
            or parsed.username is not None or parsed.password is not None
            or parsed.query or parsed.fragment or parsed.port not in (None, 443)
        ):
            raise ConnectorConfigurationError("Zoho base URL must be HTTPS.")
        if not isinstance(self.allowed_hosts, tuple) or not self.allowed_hosts:
            raise ConnectorConfigurationError("An explicit host allowlist is required.")
        allowed = {
            item.lower().rstrip(".")
            for item in self.allowed_hosts
            if isinstance(item, str) and item
        }
        if host not in allowed:
            raise ConnectorConfigurationError("Zoho API host is not allowlisted.")
        if (
            isinstance(self.timeout_seconds, bool)
            or not isinstance(self.timeout_seconds, (int, float))
            or not 0 < self.timeout_seconds <= 120
        ):
            raise ConnectorConfigurationError("Invalid timeout.")
        if not isinstance(self.credential_env_var, str) or not _ENV.fullmatch(self.credential_env_var):
            raise ConnectorConfigurationError("Invalid credential environment variable.")
        if not isinstance(self.operations, tuple):
            raise ConnectorConfigurationError("Operations must be a tuple.")
        names = []
        for operation in self.operations:
            if not isinstance(operation, ZohoOperation):
                raise ConnectorConfigurationError("Invalid operation configuration.")
            if not _NAME.fullmatch(operation.name):
                raise ConnectorConfigurationError("Invalid operation name.")
            path = operation.path
            if (
                not isinstance(path, str) or not path.startswith("/")
                or path.startswith("//") or "://" in path
                or "?" in path or "#" in path or "\\" in path
                or any(part in {".", ".."} for part in path.split("/"))
                or any(ord(ch) < 32 for ch in path)
            ):
                raise ConnectorConfigurationError("Operation path must be a safe absolute API path.")
            if not isinstance(operation.query_parameters, tuple) or any(
                not isinstance(key, str) or not _NAME.fullmatch(key)
                for key in operation.query_parameters
            ):
                raise ConnectorConfigurationError("Invalid query parameter allowlist.")
            if not isinstance(operation.required_permissions, tuple):
                raise ConnectorConfigurationError("Operation permissions must be a tuple.")
            names.append(operation.name)
        if len(names) != len(set(names)):
            raise ConnectorConfigurationError("Operation names must be unique.")
        if not isinstance(self.required_permissions, tuple):
            raise ConnectorConfigurationError("Required permissions must be a tuple.")
