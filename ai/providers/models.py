from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from .constants import (
    ModelCapability,
    ProviderStatus,
    ProviderTier,
    ProviderType,
)


@dataclass
class ModelMetadata:
    model_id: str
    provider: str
    tier: ProviderTier
    provider_type: ProviderType

    context_window: int = 0
    max_output_tokens: int = 0

    input_cost_per_1m_tokens: float = 0.0
    output_cost_per_1m_tokens: float = 0.0

    average_latency_ms: float = 0.0
    quality_score: float = 0.0

    capabilities: List[ModelCapability] = field(default_factory=list)

    enabled: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProviderMetadata:
    provider_id: str
    name: str
    provider_type: ProviderType

    tier: Optional[ProviderTier] = None

    status: ProviderStatus = ProviderStatus.ACTIVE

    models: List[ModelMetadata] = field(default_factory=list)

    supports_streaming: bool = False
    supports_tools: bool = False

    priority: int = 100

    metadata: Dict[str, Any] = field(default_factory=dict)

