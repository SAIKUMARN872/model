"""Custom operation schema validation and metadata creation."""

from ai.connectors.models import ConnectorMetadata
from ai.connectors.schemas import validate_connector_arguments
from .config import CustomConnectorConfig


def build_custom_metadata(config: CustomConnectorConfig) -> ConnectorMetadata:
    return ConnectorMetadata(
        name=config.name,
        version=config.version,
        description=config.description,
        operations=tuple(op.name for op in config.operations),
        operation_schemas=config.operation_schemas,
        required_permissions=config.required_permissions,
    )


def validate_custom_arguments(config, operation, arguments):
    return validate_connector_arguments(
        build_custom_metadata(config), operation, arguments
    )
