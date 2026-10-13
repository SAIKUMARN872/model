"""Health checks for registered ModelNow tools."""

from __future__ import annotations

from typing import Any

from ..registry.registry import ToolNotFoundError, ToolRegistry
from .health import HealthReport, HealthStatus, ToolHealth
from .monitor import ToolHealthMonitor


class ToolHealthChecker:
    """Check registration health without invoking potentially unsafe handlers."""

    def __init__(
        self,
        registry: ToolRegistry,
        monitor: ToolHealthMonitor | None = None,
    ) -> None:
        if not isinstance(registry, ToolRegistry):
            raise TypeError("registry must be a ToolRegistry.")
        if monitor is not None and not isinstance(
            monitor, ToolHealthMonitor
        ):
            raise TypeError("monitor must be a ToolHealthMonitor.")

        self.registry = registry
        self.monitor = monitor or ToolHealthMonitor()

    def check_tool(
        self,
        name: str,
        version: str | None = None,
    ) -> ToolHealth:
        """Check one tool without executing its handler."""
        if not isinstance(name, str) or not name.strip():
            return ToolHealth(
                name=name if isinstance(name, str) else str(name),
                version=version,
                status=HealthStatus.UNKNOWN,
                handler_available=False,
                enabled=False,
                message="Tool name must be a non-empty string.",
            )

        try:
            tool = self.registry.get(name.strip(), version=version)
        except ToolNotFoundError:
            return ToolHealth(
                name=name.strip(),
                version=version,
                status=HealthStatus.NOT_FOUND,
                handler_available=False,
                enabled=False,
                message="Tool or requested version is not registered.",
            )
        except (TypeError, ValueError) as exc:
            return ToolHealth(
                name=name.strip(),
                version=version,
                status=HealthStatus.UNKNOWN,
                handler_available=False,
                enabled=False,
                message=f"Invalid health check request: {exc}",
            )

        metrics = self.monitor.get_metrics(tool.name, tool.version)
        handler_available = callable(tool.handler)

        if not tool.enabled:
            status = HealthStatus.DISABLED
            message = "Tool is registered but disabled."
        elif not handler_available:
            status = HealthStatus.UNHEALTHY
            message = "Registered tool handler is not callable."
        else:
            status = HealthStatus.HEALTHY
            message = (
                "Tool is registered and enabled; "
                "external dependencies have not been probed."
            )

        return ToolHealth(
            name=tool.name,
            version=tool.version,
            status=status,
            handler_available=handler_available,
            enabled=tool.enabled,
            message=message,
            execution_count=metrics["execution_count"],
            success_count=metrics["success_count"],
            failure_count=metrics["failure_count"],
            last_execution_status=metrics["last_execution_status"],
        )

    def check_all(self, *, include_disabled: bool = True) -> HealthReport:
        """Build a health report for registered tool versions."""
        if not isinstance(include_disabled, bool):
            raise TypeError("include_disabled must be a boolean.")

        tools = self.registry.list_tools(
            enabled_only=not include_disabled
        )
        results = tuple(
            self.check_tool(tool.name, tool.version)
            for tool in tools
        )

        healthy = sum(
            item.status is HealthStatus.HEALTHY for item in results
        )
        unhealthy = sum(
            item.status in (
                HealthStatus.UNHEALTHY,
                HealthStatus.UNKNOWN,
            )
            for item in results
        )
        disabled = sum(
            item.status is HealthStatus.DISABLED for item in results
        )

        if unhealthy:
            overall = HealthStatus.UNHEALTHY
        elif disabled or not results:
            overall = HealthStatus.UNKNOWN
        else:
            overall = HealthStatus.HEALTHY

        return HealthReport(
            status=overall,
            total_tools=len(results),
            healthy_tools=healthy,
            unhealthy_tools=unhealthy,
            disabled_tools=disabled,
            tools=results,
        )

