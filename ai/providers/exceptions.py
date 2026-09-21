@'
class ProviderError(Exception):
    """Base exception for ModelNow providers."""


class ProviderConfigurationError(ProviderError):
    """Provider configuration is invalid."""


class ProviderAuthenticationError(ProviderError):
    """Provider authentication failed."""


class ProviderRateLimitError(ProviderError):
    """Provider rate limit was reached."""


class ProviderTimeoutError(ProviderError):
    """Provider request timed out."""


class ProviderUnavailableError(ProviderError):
    """Provider is temporarily unavailable."""


class ProviderExecutionError(ProviderError):
    """Provider execution failed."""


class UnsupportedModelError(ProviderError):
    """Requested model is not supported."""
'@ | Set-Content ".\ai\providers\exceptions.py"