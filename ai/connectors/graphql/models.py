"""GraphQL operation model."""
from dataclasses import dataclass
from typing import Mapping, Any

@dataclass(frozen=True)
class GraphQLOperation:
    name: str
    query: str
    operation_type: str
    variable_schema: Mapping[str, Any]
    required_permissions: tuple[str, ...] = ()
