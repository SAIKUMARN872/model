"""
Global AI platform constants.
"""

from __future__ import annotations


PACKAGE_NAME = "ai"

PACKAGE_VERSION = "1.0.0"

DEFAULT_TIMEOUT = 30.0

DEFAULT_MAX_RETRIES = 3

DEFAULT_MAX_CONCURRENCY = 4

DEFAULT_MAX_CONTEXT_ITEMS = 100

DEFAULT_MAX_OUTPUT_LENGTH = 100_000

DEFAULT_TEMPERATURE = 0.2

SUPPORTED_PROTOCOLS = {
    "http",
    "https",
}

SUPPORTED_TASK_TYPES = {
    "chat",
    "coding",
    "research",
    "browser",
    "planning",
    "execution",
}

ENVIRONMENT_VARIABLES = {
    "AI_ENV": "runtime environment",
    "AI_LOG_LEVEL": "logging level",
    "AI_TIMEOUT": "default operation timeout",
    "AI_MAX_RETRIES": "default retry count",
}