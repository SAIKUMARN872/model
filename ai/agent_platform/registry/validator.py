from __future__ import annotations

from ..exceptions import AgentValidationError
from ..models import AgentMetadata


def validate_metadata(metadata: AgentMetadata) -> None:
    if not isinstance(metadata, AgentMetadata):
        raise AgentValidationError("Expected AgentMetadata")

    if not metadata.agent_id.strip():
        raise AgentValidationError("agent_id cannot be empty")

    if not metadata.name.strip():
        raise AgentValidationError("name cannot be empty")

    if not metadata.version.strip():
        raise AgentValidationError("version cannot be empty")

    if len(set(metadata.capabilities)) != len(metadata.capabilities):
        raise AgentValidationError("capabilities must not contain duplicates")

    if any(not item.strip() for item in metadata.capabilities):
        raise AgentValidationError("capabilities cannot contain empty values")
