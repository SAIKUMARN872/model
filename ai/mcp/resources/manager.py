"""In-memory MCP resource registry."""
from threading import RLock
from ai.mcp.resources.resource import MCPResource
from ai.mcp.resources.utils import validate_resource_uri


class MCPResourceManager:
    def __init__(self) -> None:
        self._resources: dict[str, MCPResource] = {}
        self._lock = RLock()

    def register(self, resource: MCPResource, *, replace: bool = False) -> MCPResource:
        if not isinstance(resource, MCPResource):
            raise TypeError("resource must be an MCPResource.")
        with self._lock:
            if resource.uri in self._resources and not replace:
                raise ValueError(f"Resource already registered: {resource.uri}")
            self._resources[resource.uri] = resource
        return resource

    def get(self, uri: str) -> MCPResource | None:
        validate_resource_uri(uri)
        with self._lock:
            return self._resources.get(uri)

    def require(self, uri: str) -> MCPResource:
        resource = self.get(uri)
        if resource is None:
            raise KeyError(f"Unknown MCP resource: {uri}")
        return resource

    def list_resources(self) -> list[MCPResource]:
        with self._lock:
            return list(self._resources.values())

    def remove(self, uri: str) -> bool:
        validate_resource_uri(uri)
        with self._lock:
            return self._resources.pop(uri, None) is not None

    def __len__(self) -> int:
        with self._lock:
            return len(self._resources)
