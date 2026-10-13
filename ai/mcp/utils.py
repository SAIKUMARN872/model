"""MCP serialization and safe utility helpers."""

import json


def json_dumps(value) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def json_loads(value):
    if not isinstance(value, (str, bytes, bytearray)):
        raise TypeError("JSON input must be text or bytes.")
    return json.loads(value)
