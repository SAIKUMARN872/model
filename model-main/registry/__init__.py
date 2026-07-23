"""
Registry package.

Provides centralized component registration
for services, providers, models, routes,
plugins, and application dependencies.
"""

from .service_registry import (
    ServiceRegistry,
)

from .provider_registry import (
    ProviderRegistry,
)

from .model_registry import (
    ModelRegistry,
)

from .route_registry import (
    RouteRegistry,
)

from .plugin_registry import (
    PluginRegistry,
)


__all__ = [

    # Services
    "ServiceRegistry",

    # Providers
    "ProviderRegistry",

    # Models
    "ModelRegistry",

    # Routes
    "RouteRegistry",

    # Plugins
    "PluginRegistry",
]