"""
Utilities for the ModelNow coding package.
"""

from __future__ import annotations

import ast
import asyncio
import inspect
import re
from typing import Any, Awaitable, Callable


async def execute_handler(
    handler: Callable[..., Any],
    *args: Any,
    **kwargs: Any,
) -> Any:
    """
    Execute synchronous or asynchronous handlers.
    """

    if not callable(handler):
        raise TypeError(
            "Handler must be callable"
        )

    result = handler(
        *args,
        **kwargs,
    )

    if inspect.isawaitable(result):
        return await result

    return result


def extract_code_block(
    text: str,
) -> str:
    """
    Extract code from Markdown code fences.
    """

    if not text:
        return ""

    pattern = (
        r"```(?:[a-zA-Z0-9_+-]+)?\s*"
        r"(.*?)"
        r"```"
    )

    match = re.search(
        pattern,
        text,
        flags=re.DOTALL,
    )

    if match:
        return match.group(1).strip()

    return text.strip()


def validate_python(
    code: str,
    filename: str = "<code>",
) -> tuple[bool, str | None]:

    try:

        ast.parse(
            code,
            filename=filename,
        )

        return True, None

    except SyntaxError as exc:

        return False, (
            f"{exc.msg} at line "
            f"{exc.lineno}"
        )


def compile_python(
    code: str,
    filename: str = "<code>",
) -> Any:

    return compile(
        code,
        filename,
        "exec",
    )


def count_lines(
    code: str,
) -> int:

    if not code:
        return 0

    return len(
        code.splitlines()
    )


def count_characters(
    code: str,
) -> int:

    return len(code)


def detect_language(
    filename: str | None,
) -> str:

    if not filename:
        return "text"

    extension = (
        filename.lower()
        .rsplit(".", 1)[-1]
        if "." in filename
        else ""
    )

    languages = {
        "py": "python",
        "js": "javascript",
        "ts": "typescript",
        "java": "java",
        "go": "go",
        "rs": "rust",
        "cpp": "cpp",
        "c": "c",
        "cs": "csharp",
        "rb": "ruby",
        "php": "php",
        "sql": "sql",
        "sh": "shell",
    }

    return languages.get(
        extension,
        "text",
    )


def normalize_language(
    language: str,
) -> str:

    aliases = {
        "py": "python",
        "python3": "python",
        "js": "javascript",
        "node": "javascript",
        "ts": "typescript",
        "golang": "go",
        "c++": "cpp",
        "c#": "csharp",
        "shellscript": "shell",
    }

    normalized = (
        language.strip().lower()
    )

    return aliases.get(
        normalized,
        normalized,
    )


def remove_comments(
    code: str,
) -> str:
    """
    Basic comment removal for Python code.

    This is intended for lightweight analysis only.
    """

    try:

        tree = ast.parse(code)

    except SyntaxError:

        return code

    lines = code.splitlines()

    comment_lines = set()

    for node in ast.walk(tree):

        if isinstance(
            node,
            (
                ast.FunctionDef,
                ast.AsyncFunctionDef,
                ast.ClassDef,
                ast.Module,
            ),
        ):
            continue

    for index, line in enumerate(
        lines
    ):

        stripped = line.strip()

        if stripped.startswith("#"):
            comment_lines.add(index)

    return "\n".join(
        line
        for index, line in enumerate(lines)
        if index not in comment_lines
    )


def run_python_code(
    code: str,
    namespace: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Execute Python code in an explicitly supplied namespace.

    WARNING:
        Do not use this with untrusted code.
    """

    namespace = namespace or {}

    compiled = compile_python(
        code
    )

    exec(
        compiled,
        namespace,
        namespace,
    )

    return namespace


def is_async_callable(
    function: Callable[..., Any],
) -> bool:

    return inspect.iscoroutinefunction(
        function
    )


def run_sync(
    awaitable: Awaitable[Any],
) -> Any:

    try:
        asyncio.get_running_loop()

    except RuntimeError:

        return asyncio.run(
            awaitable
        )

    raise RuntimeError(
        "Cannot run synchronously while "
        "an event loop is already running."
    )