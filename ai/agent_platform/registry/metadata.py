"""
Metadata models for the Agent Platform registry.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ComponentMetadata:
    """
    Metadata describing a registered platform component.
    """

    name: str
    component_type: str

    version: str = "1.0.0"

    description: str = ""

    provider: Optional[str] = None

    capabilities: List[str] = field(
        default_factory=list
    )

    tags: List[str] = field(
        default_factory=list
    )

    enabled: bool = True

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    def has_capability(
        self,
        capability: str,
    ) -> bool:
        return capability in self.capabilities

    def has_tag(
        self,
        tag: str,
    ) -> bool:
        return tag in self.tags


@dataclass
class AgentMetadata(ComponentMetadata):
    """
    Metadata specifically describing an agent.
    """

    component_type: str = "agent"

    agent_type: Optional[str] = None

    model: Optional[str] = None

    tools: List[str] = field(
        default_factory=list
    )

    supports_streaming: bool = False


@dataclass
class ModelMetadata(ComponentMetadata):
    """
    Metadata specifically describing a model.
    """

    component_type: str = "model"

    model_type: Optional[str] = None

    context_window: Optional[int] = None

    max_output_tokens: Optional[int] = None

    input_price: Optional[float] = None

    output_price: Optional[float] = None

    supports_streaming: bool = False

    supports_tools: bool = False

    supports_vision: bool = False


def merge_metadata(
    base: ComponentMetadata,
    extra: Dict[str, Any],
) -> ComponentMetadata:
    """
    Merge additional metadata into a component.
    """

    data = base.to_dict()

    custom_metadata = data.get(
        "metadata",
        {},
    )

    custom_metadata.update(extra)

    data["metadata"] = custom_metadata

    return ComponentMetadata(
        name=data["name"],
        component_type=data["component_type"],
        version=data["version"],
        description=data["description"],
        provider=data["provider"],
        capabilities=data["capabilities"],
        tags=data["tags"],
        enabled=data["enabled"],
        metadata=data["metadata"],
    )