"""Real HTTPS smoke test through the ModelNow ToolExecutor."""

import asyncio
import urllib.request

from ai.tool_platform.executor import ExecutionStatus, ToolExecutor
from ai.tool_platform.permissions import PermissionContext
from ai.tool_platform.registry import ToolRegistry, ToolSpec


def fetch_example_domain():
    request = urllib.request.Request(
        "https://example.com/",
        headers={"User-Agent": "ModelNow-ToolPlatform-SmokeTest/1.0"},
    )

    with urllib.request.urlopen(request, timeout=10) as response:
        body = response.read(4096).decode("utf-8", errors="replace")
        return {
            "http_status": response.status,
            "body_preview": body,
            "content_type": response.headers.get("Content-Type", ""),
        }


async def main():
    registry = ToolRegistry()
    executor = ToolExecutor(registry, timeout_seconds=15)

    registry.register(
        ToolSpec(
            name="external_http_smoke",
            description="Fetch a public HTTPS page for connectivity verification.",
            handler=fetch_example_domain,
            input_schema={
                "type": "object",
                "properties": {},
                "required": [],
                "additionalProperties": False,
            },
            required_permissions=("tools:execute",),
            tags=("smoke-test", "http"),
        )
    )

    context = PermissionContext(
        user_id="local-smoke-test",
        permissions=frozenset({"tools:execute"}),
    )

    result = await executor.execute(
        "external_http_smoke",
        {},
        context=context,
    )

    print("=== ModelNow External HTTP Smoke Test ===")
    print("Success:", result.success)
    print("Execution status:", result.status.value)
    print("Duration (seconds):", round(result.duration_seconds, 3))

    if result.error:
        print("Error:", result.error)

    if not result.success:
        raise SystemExit(1)

    output = result.output
    assert output["http_status"] == 200, (
        f"Expected HTTP 200, got {output['http_status']}"
    )
    assert "Example Domain" in output["body_preview"], (
        "Expected page content was not found."
    )

    print("HTTP status:", output["http_status"])
    print("Content type:", output["content_type"])
    print("Body verification: PASS")
    print("RESULT: ALL CHECKS PASSED")


if __name__ == "__main__":
    asyncio.run(main())
