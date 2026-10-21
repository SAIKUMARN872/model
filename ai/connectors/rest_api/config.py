"""REST API connector configuration."""
from dataclasses import dataclass
import re
from urllib.parse import urlsplit

from ai.connectors.exceptions import ConnectorConfigurationError

_ENV = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
_NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_.-]{0,63}$")
_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE"}


@dataclass(frozen=True, slots=True)
class RESTAPIOperationConfig:
    name: str
    method: str
    path: str
    query_schema: dict | None = None
    body_schema: dict | None = None
    required_permissions: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class RESTAPIConfig:
    base_url: str
    allowed_hosts: tuple[str, ...]
    operations: tuple[RESTAPIOperationConfig, ...]
    credential_env_var: str | None = "REST_API_ACCESS_TOKEN"
    timeout_seconds: float = 15.0
    enable_mutations: bool = False
    required_permissions: tuple[str, ...] = ("rest_api:read",)

    def __post_init__(self):
        try:
            parsed = urlsplit(self.base_url)
            if (
                parsed.scheme != "https"
                or not parsed.hostname
                or parsed.username
                or parsed.password
                or parsed.query
                or parsed.fragment
                or parsed.hostname.lower() not in {
                    host.lower() for host in self.allowed_hosts
                }
            ):
                raise ValueError
        except (TypeError, ValueError):
            raise ConnectorConfigurationError(
                "REST base URL must use HTTPS and an explicitly allowlisted host."
            ) from None

        if not self.allowed_hosts or any(
            not isinstance(host, str) or not host.strip()
            for host in self.allowed_hosts
        ):
            raise ConnectorConfigurationError("Explicit allowed_hosts are required.")
        if isinstance(self.timeout_seconds, bool) or not 0 < self.timeout_seconds <= 120:
            raise ConnectorConfigurationError("Invalid REST API timeout.")
        if self.credential_env_var is not None and (
            not isinstance(self.credential_env_var, str)
            or not _ENV.fullmatch(self.credential_env_var)
        ):
            raise ConnectorConfigurationError("Invalid credential environment variable.")

        names = set()
        for op in self.operations:
            if not isinstance(op, RESTAPIOperationConfig):
                raise ConnectorConfigurationError("Invalid REST operation configuration.")
            if not isinstance(op.name, str) or not _NAME.fullmatch(op.name) or op.name in names:
                raise ConnectorConfigurationError("REST operation names must be unique and valid.")
            names.add(op.name)
            if not isinstance(op.method, str) or op.method.upper() not in _METHODS:
                raise ConnectorConfigurationError("Unsupported REST method.")
            if (
                not isinstance(op.path, str)
                or not op.path
                or op.path.startswith("//")
                or "://" in op.path
                or "?" in op.path
                or "#" in op.path
                or any(part in (".", "..") for part in op.path.split("/"))
                or any(ord(char) < 32 for char in op.path)
            ):
                raise ConnectorConfigurationError("REST operation path must be a safe relative path.")
            if op.method.upper() != "GET" and not self.enable_mutations:
                raise ConnectorConfigurationError(
                    "Write-capable REST methods require enable_mutations=True."
                )
            if op.method.upper() != "GET" and not op.required_permissions:
                raise ConnectorConfigurationError(
                    "Write-capable operations must declare required_permissions."
                )


def create_rest_api_config(base_url, allowed_hosts, operations, **kwargs):
    return RESTAPIConfig(
        base_url=base_url,
        allowed_hosts=tuple(allowed_hosts),
        operations=tuple(operations),
        **kwargs,
    )
