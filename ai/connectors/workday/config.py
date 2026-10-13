"""Workday tenant and operation configuration."""
from dataclasses import dataclass
import re
from urllib.parse import urlsplit

from ai.connectors.exceptions import ConnectorConfigurationError

_NAME = re.compile(r"^[a-z][a-z0-9_.-]{0,63}$")
_ENV = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
_PARAM = re.compile(r"^[A-Za-z][A-Za-z0-9_]{0,63}$")


@dataclass(frozen=True, slots=True)
class WorkdayOperationConfig:
    name: str
    path: str
    path_parameters: tuple[str, ...] = ()
    required_permissions: tuple[str, ...] = ("workday:read",)

    def __post_init__(self):
        if not isinstance(self.name, str) or not _NAME.fullmatch(self.name):
            raise ConnectorConfigurationError("Invalid Workday operation name.")
        if not isinstance(self.path, str) or not self.path.startswith("/") or self.path.startswith("//"):
            raise ConnectorConfigurationError("Workday path must be a relative absolute-path.")
        parsed = urlsplit(self.path)
        if parsed.scheme or parsed.netloc or parsed.query or parsed.fragment or "\\" in self.path:
            raise ConnectorConfigurationError("Workday path must not contain a host, query, or fragment.")
        if any(part in {".", ".."} for part in self.path.split("/")):
            raise ConnectorConfigurationError("Workday path traversal is not allowed.")
        if not isinstance(self.path_parameters, tuple) or any(
            not isinstance(p, str) or not _PARAM.fullmatch(p) for p in self.path_parameters
        ):
            raise ConnectorConfigurationError("Invalid Workday path parameter.")
        placeholders = re.findall(r"\{([^{}]+)\}", self.path)
        if len(placeholders) != len(set(placeholders)) or set(placeholders) != set(self.path_parameters):
            raise ConnectorConfigurationError("Workday path placeholders must match path_parameters.")
        if not isinstance(self.required_permissions, tuple) or any(
            not isinstance(p, str) or not p for p in self.required_permissions
        ):
            raise ConnectorConfigurationError("Invalid Workday permissions.")


@dataclass(frozen=True, slots=True)
class WorkdayConfig:
    base_url: str
    allowed_hosts: tuple[str, ...]
    operations: tuple[WorkdayOperationConfig, ...]
    credential_env_var: str = "WORKDAY_ACCESS_TOKEN"
    timeout_seconds: float = 20.0
    max_page_size: int = 100
    required_permissions: tuple[str, ...] = ("workday:read",)

    def __post_init__(self):
        if not isinstance(self.base_url, str):
            raise ConnectorConfigurationError("Workday base URL is required.")
        parsed = urlsplit(self.base_url)
        host = (parsed.hostname or "").lower().rstrip(".")
        if (
            parsed.scheme != "https" or not host or parsed.username is not None
            or parsed.password is not None or parsed.query or parsed.fragment
            or parsed.port not in (None, 443)
        ):
            raise ConnectorConfigurationError("Workday base URL must be HTTPS without credentials or query.")
        if not isinstance(self.allowed_hosts, tuple) or not self.allowed_hosts:
            raise ConnectorConfigurationError("Explicit Workday host allowlist is required.")
        normalized = {item.lower().rstrip(".") for item in self.allowed_hosts if isinstance(item, str)}
        if host not in normalized:
            raise ConnectorConfigurationError("Workday base host is not allowlisted.")
        if isinstance(self.timeout_seconds, bool) or not isinstance(self.timeout_seconds, (int, float)) or not 0 < self.timeout_seconds <= 120:
            raise ConnectorConfigurationError("Invalid Workday timeout.")
        if isinstance(self.max_page_size, bool) or not isinstance(self.max_page_size, int) or not 1 <= self.max_page_size <= 200:
            raise ConnectorConfigurationError("Invalid Workday page size.")
        if not isinstance(self.credential_env_var, str) or not _ENV.fullmatch(self.credential_env_var):
            raise ConnectorConfigurationError("Invalid Workday credential environment variable.")
        if not isinstance(self.operations, tuple) or not self.operations:
            raise ConnectorConfigurationError("At least one Workday operation must be configured.")
        if any(not isinstance(op, WorkdayOperationConfig) for op in self.operations):
            raise ConnectorConfigurationError("Invalid Workday operation configuration.")
        names = [op.name for op in self.operations]
        if len(names) != len(set(names)):
            raise ConnectorConfigurationError("Workday operation names must be unique.")
