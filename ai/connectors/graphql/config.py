"""Configuration for allowlisted GraphQL operations."""
from dataclasses import dataclass
from typing import Mapping

from ai.connectors.exceptions import ConnectorConfigurationError


@dataclass(frozen=True)
class GraphQLOperationConfig:
    name: str
    query: str
    operation_type: str = "query"
    variable_schema: Mapping = None
    required_permissions: tuple[str, ...] = ()


@dataclass(frozen=True)
class GraphQLConfig:
    endpoint_url: str
    allowed_hosts: tuple[str, ...]
    operations: tuple[GraphQLOperationConfig, ...]
    credential_env_var: str = "GRAPHQL_ACCESS_TOKEN"
    timeout_seconds: float = 15.0
    enable_mutations: bool = False

    def __post_init__(self):
        from urllib.parse import urlsplit
        parsed = urlsplit(self.endpoint_url)
        if (
            parsed.scheme != "https"
            or not parsed.hostname
            or parsed.username
            or parsed.password
            or parsed.query
            or parsed.fragment
            or parsed.hostname.lower() not in {h.lower() for h in self.allowed_hosts}
        ):
            raise ConnectorConfigurationError(
                "GraphQL endpoint must be HTTPS and use an explicitly allowed host."
            )
        if not 0 < self.timeout_seconds <= 120:
            raise ConnectorConfigurationError("Invalid GraphQL timeout.")
        if not self.credential_env_var:
            raise ConnectorConfigurationError("Credential environment variable is required.")
        names = set()
        for op in self.operations:
            if not op.name or op.name in names:
                raise ConnectorConfigurationError("GraphQL operation names must be unique.")
            names.add(op.name)
            if op.operation_type not in ("query", "mutation"):
                raise ConnectorConfigurationError("Only query and mutation operations are supported.")
            if not isinstance(op.query, str) or not op.query.strip():
                raise ConnectorConfigurationError("GraphQL operation query cannot be empty.")


