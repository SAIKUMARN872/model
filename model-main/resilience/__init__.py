"""
Resilience package.

Provides reliability patterns for
production services.

Includes:
- Retry mechanisms
- Circuit breakers
- Timeouts
- Rate limiting
- Fault handling
"""

from .retry import (
    RetryPolicy,
)

from .circuit_breaker import (
    CircuitBreaker,
)

from .timeout import (
    TimeoutManager,
)

from .fallback import (
    FallbackHandler,
)


__all__ = [

    # Retry
    "RetryPolicy",

    # Circuit breaker
    "CircuitBreaker",

    # Timeout
    "TimeoutManager",

    # Fallback
    "FallbackHandler",
]