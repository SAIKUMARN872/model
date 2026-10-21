"""MCP execution adapter backed by the ModelNow Tool Platform."""

from typing import Any

from ai.tool_platform.executor import ToolExecutor
from ai.tool_platform.registry import ToolRegistry

from ai.mcp.tools.validator import validate_arguments, validate_tool_definition


class MCPToolExecutor:
    """Validate tool inputs before delegating execution to ToolExecutor."""

    def __init__(
        self,
        registry: ToolRegistry,
        executor: ToolExecutor | None = None,
    ) -> None:
        if not isinstance(registry, ToolRegistry):
            raise TypeError("registry must be a ToolRegistry.")
        if executor is not None and not isinstance(executor, ToolExecutor):
            raise TypeError("executor must be a ToolExecutor.")
        if executor is not None and executor.registry is not registry:
            raise ValueError("executor must use the supplied registry.")

        self.registry = registry
        self.executor = executor or ToolExecutor(registry)

    async def execute(
        self,
        name: str,
        arguments: dict[str, Any] | None = None,
        *,
        version: str | None = None,
        context: Any = None,
    ):
        """Execute a registered tool after validating its declared inputs."""
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Tool name must be a non-empty string.")

        tool = self.registry.get(name, version)
        validate_tool_definition(tool)
        checked_arguments = validate_arguments(tool, arguments)

        return await self.executor.execute(
            name,
            checked_arguments,
            version=version,
            context=context,
        )
