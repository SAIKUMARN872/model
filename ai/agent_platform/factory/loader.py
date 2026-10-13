from __future__ import annotations

import importlib
from typing import Any


def load_symbol(import_path: str) -> Any:
    """Load an explicitly named Python symbol using 'package.module:Symbol'."""
    if not isinstance(import_path, str) or not import_path.strip():
        raise ValueError("import_path must be a non-empty string")

    path = import_path.strip()
    if path.count(":") != 1:
        raise ValueError(
            "import_path must use the format 'package.module:Symbol'"
        )

    module_path, symbol_name = (part.strip() for part in path.split(":", 1))
    if not module_path or not symbol_name:
        raise ValueError("Both module path and symbol name are required")

    module = importlib.import_module(module_path)

    try:
        return getattr(module, symbol_name)
    except AttributeError as exc:
        raise ImportError(
            f"Symbol '{symbol_name}' was not found in '{module_path}'"
        ) from exc


def load_agent_class(import_path: str) -> type:
    symbol = load_symbol(import_path)
    if not isinstance(symbol, type):
        raise TypeError(f"'{import_path}' does not identify a class")
    if not callable(getattr(symbol, "execute", None)):
        raise TypeError(
            f"Class '{import_path}' must define an execute method"
        )
    return symbol
