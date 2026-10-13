"""Handle MCP JSON-RPC messages using the ModelNow Tool Platform."""

from ai.tool_platform.executor import ToolExecutor
from ai.tool_platform.permissions import PermissionContext
from ai.tool_platform.registry import ToolRegistry

from ai.mcp.constants import PROTOCOL_VERSION
from ai.mcp.models import MCPServerInfo
from ai.mcp.protocol.messages import error_response, success_response
from ai.mcp.registry.catalog import MCPCatalog
from ai.mcp.schemas import validate_jsonrpc_message, validate_tool_arguments
from ai.mcp.resources.manager import MCPResourceManager
from ai.mcp.server.routes import list_resources, read_resource
from ai.mcp.tools.executor import MCPToolExecutor


class MCPHandler:
    def __init__(
        self,
        registry: ToolRegistry,
        executor: ToolExecutor,
        *,
        server_info=None,
        permission_context: PermissionContext | None = None,
        resource_manager: MCPResourceManager | None = None,
    ):
        if not isinstance(registry, ToolRegistry):
            raise TypeError("registry must be ToolRegistry.")
        if not isinstance(executor, (ToolExecutor, MCPToolExecutor)):
            raise TypeError("executor must be ToolExecutor or MCPToolExecutor.")
        self.registry = registry
        self.executor = executor
        self.server_info = server_info or MCPServerInfo()
        self.permission_context = permission_context
        self.catalog = MCPCatalog(registry)
        if resource_manager is not None and not isinstance(
            resource_manager, MCPResourceManager
        ):
            raise TypeError("resource_manager must be an MCPResourceManager.")
        self.resource_manager = (
            resource_manager if resource_manager is not None
            else MCPResourceManager()
        )

    async def handle(self, message):
        request_id = message.get("id") if isinstance(message, dict) else None
        is_notification = isinstance(message, dict) and "id" not in message
        try:
            message = validate_jsonrpc_message(message)
            method = message["method"]
            params = message.get("params", {})

            if method == "initialize":
                result = {
                    "protocolVersion": PROTOCOL_VERSION,
                    "capabilities": {
                        "tools": {"listChanged": False},
                        "resources": {"subscribe": False, "listChanged": False},
                    },
                    "serverInfo": {
                        "name": self.server_info.name,
                        "version": self.server_info.version,
                    },
                }
            elif method == "ping":
                result = {}
            elif method == "tools/list":
                result = {"tools": self.catalog.list_tools()}
            elif method == "resources/list":
                result = list_resources(self.resource_manager)
            elif method == "resources/read":
                result = read_resource(self.resource_manager, params)
            elif method == "tools/call":
                name, arguments = validate_tool_arguments(params)
                execution = await self.executor.execute(
                    name, arguments, context=self.permission_context
                )
                if not execution.success:
                    result = {
                        "content": [{
                            "type": "text",
                            "text": execution.error or "Tool execution failed.",
                        }],
                        "isError": True,
                    }
                else:
                    output = execution.output
                    if isinstance(output, str):
                        rendered = output
                    else:
                        import json
                        rendered = json.dumps(output, ensure_ascii=False, default=str)
                    result = {
                        "content": [{"type": "text", "text": rendered}],
                        "isError": False,
                    }
            elif method == "notifications/initialized":
                return None
            else:
                if is_notification:
                    return None
                return error_response(request_id, -32601, "Method not found.")

            if is_notification:
                return None
            return success_response(request_id, result)
        except KeyError as exc:
            if is_notification:
                return None
            return error_response(request_id, -32002, str(exc))
        except (TypeError, ValueError) as exc:
            if is_notification:
                return None
            return error_response(request_id, -32602, str(exc))
        except Exception:
            if is_notification:
                return None
            return error_response(request_id, -32603, "Internal server error.")

