"""
Agent configuration loader.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Mapping

from .models import (
    AgentConfig,
    AgentDefinition,
    AgentType,
    MemoryConfig,
    ModelConfig,
    ModelType,
    ToolConfig,
)


class AgentLoader:
    """
    Loads and converts external agent definitions into
    strongly typed factory models.
    """

    def load_file(self, path: str | Path) -> AgentDefinition:
        """Load an agent definition from a JSON file."""

        file_path = Path(path)

        if not file_path.exists():
            raise FileNotFoundError(
                f"Agent configuration not found: {file_path}"
            )

        with file_path.open("r", encoding="utf-8") as file:
            data = json.load(file)

        return self.load(data)

    def load(
        self,
        data: Mapping[str, Any],
    ) -> AgentDefinition:
        """Convert a dictionary into an AgentDefinition."""

        if not isinstance(data, Mapping):
            raise TypeError("Agent configuration must be a mapping.")

        model = self._load_model(data.get("model"))

        tools = [
            self._load_tool(tool)
            for tool in data.get("tools", [])
        ]

        memory = self._load_memory(data.get("memory"))

        agent_type = data.get("agent_type", AgentType.CUSTOM)

        if not isinstance(agent_type, AgentType):
            agent_type = AgentType(str(agent_type))

        return AgentDefinition(
            name=str(data["name"]),
            agent_type=agent_type,
            description=data.get("description"),
            version=str(data.get("version", "1.0.0")),
            model=model,
            tools=tools,
            memory=memory,
            system_prompt=data.get("system_prompt"),
            enabled=bool(data.get("enabled", True)),
            metadata=dict(data.get("metadata", {})),
        )

    def to_config(
        self,
        definition: AgentDefinition,
    ) -> AgentConfig:
        """
        Convert an AgentDefinition into an AgentConfig.

        A model is mandatory for runtime construction.
        """

        if definition.model is None:
            raise ValueError(
                f"Agent '{definition.name}' does not define a model."
            )

        return AgentConfig(
            name=definition.name,
            agent_type=definition.agent_type,
            description=definition.description,
            system_prompt=definition.system_prompt,
            model=definition.model,
            tools=list(definition.tools),
            memory=definition.memory,
            enabled=definition.enabled,
            metadata=dict(definition.metadata),
        )

    def _load_model(
        self,
        data: Mapping[str, Any] | None,
    ) -> ModelConfig | None:
        if data is None:
            return None

        model_type = data.get(
            "model_type",
            ModelType.LLM,
        )

        if not isinstance(model_type, ModelType):
            model_type = ModelType(str(model_type))

        return ModelConfig(
            provider=str(data["provider"]),
            model_name=str(data["model_name"]),
            model_type=model_type,
            temperature=data.get("temperature"),
            max_tokens=data.get("max_tokens"),
            top_p=data.get("top_p"),
            streaming=bool(data.get("streaming", False)),
            api_key=data.get("api_key"),
            base_url=data.get("base_url"),
            timeout=data.get("timeout"),
            retries=int(data.get("retries", 3)),
            extra=dict(data.get("extra", {})),
        )

    def _load_tool(
        self,
        data: Mapping[str, Any],
    ) -> ToolConfig:
        if isinstance(data, str):
            return ToolConfig(name=data)

        return ToolConfig(
            name=str(data["name"]),
            enabled=bool(data.get("enabled", True)),
            description=data.get("description"),
            parameters=dict(data.get("parameters", {})),
            config=dict(data.get("config", {})),
        )

    def _load_memory(
        self,
        data: Mapping[str, Any] | None,
    ) -> MemoryConfig | None:
        if data is None:
            return None

        return MemoryConfig(
            enabled=bool(data.get("enabled", True)),
            short_term=bool(data.get("short_term", True)),
            long_term=bool(data.get("long_term", False)),
            episodic=bool(data.get("episodic", False)),
            semantic=bool(data.get("semantic", False)),
            working=bool(data.get("working", True)),
            max_items=data.get("max_items"),
            ttl=data.get("ttl"),
            provider=data.get("provider"),
            config=dict(data.get("config", {})),
        )