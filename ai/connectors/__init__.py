"""ModelNow shared connector framework."""

from .authentication import CredentialProvider, EnvironmentCredentialProvider
from .client import ConnectorHTTPClient
from .config import ConnectorConfig
from .connector import Connector
from .discovery import ConnectorDiscovery
from .exceptions import (
    ConnectorAuthenticationError,
    ConnectorConfigurationError,
    ConnectorError,
    ConnectorNotFoundError,
    ConnectorOperationError,
    ConnectorPermissionError,
    ConnectorRequestError,
    ConnectorValidationError,
)
from .executor import ConnectorExecutor
from .models import ConnectorMetadata, ConnectorRequest, ConnectorResult
from .permissions import authorize_connector
from .registry import ConnectorRegistry
from .schemas import validate_connector_arguments
from .tools import register_connector_tools

__all__ = [
    "Connector",
    "ConnectorConfig",
    "ConnectorMetadata",
    "ConnectorRequest",
    "ConnectorResult",
    "ConnectorRegistry",
    "ConnectorDiscovery",
    "ConnectorExecutor",
    "ConnectorHTTPClient",
    "CredentialProvider",
    "EnvironmentCredentialProvider",
    "authorize_connector",
    "validate_connector_arguments",
    "register_connector_tools",
    "ConnectorError",
    "ConnectorAuthenticationError",
    "ConnectorConfigurationError",
    "ConnectorNotFoundError",
    "ConnectorOperationError",
    "ConnectorPermissionError",
    "ConnectorRequestError",
    "ConnectorValidationError",
]
