"""
Interfaces Package

Contains abstract contracts used throughout
the application.

Interfaces define:
- Repository contracts
- Service contracts
- Provider contracts
- External integration contracts
"""

from .repository import (
    IRepository,
)

from .service import (
    IService,
)

from .provider import (
    IProvider,
)

from .cache import (
    ICache,
)

from .storage import (
    IStorage,
)

from .queue import (
    IQueue,
)


__all__ = [
    "IRepository",
    "IService",
    "IProvider",
    "ICache",
    "IStorage",
    "IQueue",
] 