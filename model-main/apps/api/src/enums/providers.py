"""
AI Provider Enumeration

Enterprise AI Provider Definitions
"""

from __future__ import annotations

from enum import Enum


# ==========================================================
# AI Providers
# ==========================================================

class AIProvider(str, Enum):
    """
    Supported AI Providers
    """

    OPENAI = "openai"

    ANTHROPIC = "anthropic"

    GOOGLE = "google"

    GROK = "grok"

    META = "meta"

    MISTRAL = "mistral"

    COHERE = "cohere"

    GROQ = "groq"

    OLLAMA = "ollama"

    HUGGINGFACE = "huggingface"

    AZURE_OPENAI = "azure_openai"

    AWS_BEDROCK = "aws_bedrock"

    VERTEX_AI = "vertex_ai"


# ==========================================================
# Provider Status
# ==========================================================

class ProviderStatus(str, Enum):
    """
    Provider Availability
    """

    ACTIVE = "active"

    INACTIVE = "inactive"

    DISABLED = "disabled"

    MAINTENANCE = "maintenance"

    UNKNOWN = "unknown"


# ==========================================================
# Provider Type
# ==========================================================

class ProviderType(str, Enum):
    """
    Provider Categories
    """

    CLOUD = "cloud"

    SELF_HOSTED = "self_hosted"

    OPEN_SOURCE = "open_source"

    ENTERPRISE = "enterprise"


# ==========================================================
# Provider Region
# ==========================================================

class ProviderRegion(str, Enum):
    """
    Deployment Regions
    """

    GLOBAL = "global"

    US = "us"

    EUROPE = "europe"

    ASIA = "asia"

    INDIA = "india"

    AUSTRALIA = "australia" 