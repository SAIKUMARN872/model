from __future__ import annotations

from typing import Any, Iterable


class ToolDiscovery:
    """Searches registered tools by name, description, and tags."""

    def __init__(self, registry: Any) -> None:
        self.registry = registry

    def search(
        self,
        query: str = "",
        tags: Iterable[str] = (),
        enabled_only: bool = True,
    ) -> list[Any]:
        normalized_query = query.strip().casefold()
        required_tags = {tag.casefold() for tag in tags}

        results = []
        for tool in self.registry.list_tools(enabled_only=enabled_only):
            searchable = f"{tool.name} {tool.description}".casefold()
            if normalized_query and normalized_query not in searchable:
                continue

            tool_tags = {tag.casefold() for tag in tool.tags}
            if not required_tags.issubset(tool_tags):
                continue

            results.append(tool)

        return results
