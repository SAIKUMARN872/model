"""Safe, consistent connector exceptions."""


class ConnectorError(Exception):
    """Base exception for connector failures."""


class ConnectorConfigurationError(ConnectorError):
    """Invalid or incomplete connector configuration."""


class ConnectorAuthenticationError(ConnectorError):
    """Missing or rejected credentials."""


class ConnectorPermissionError(ConnectorError):
    """The caller is not permitted to perform an operation."""


class ConnectorNotFoundError(ConnectorError):
    """A connector is not registered."""


class ConnectorOperationError(ConnectorError):
    """An operation is unsupported or failed."""


class ConnectorRequestError(ConnectorError):
    """An outbound request was rejected or failed."""


class ConnectorValidationError(ConnectorError, ValueError):
    """Connector input did not satisfy its schema."""
