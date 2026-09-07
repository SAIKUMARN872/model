"""
Application Configuration Package

Central configuration exports.

Contains:
- Application settings
- Environment management
- Logging configuration
- Constants
"""

from config.settings import Settings
from config.environment import Environment
from config.logging import setup_logging


# Singleton settings instance

settings = Settings()


__all__ = [
    "Settings",
    "Environment",
    "setup_logging",
    "settings",
] 