"""Newline-delimited JSON transport helpers."""
import asyncio
from typing import Any

from ai.mcp.transport.utils import (
    decode_transport_message,
    encode_transport_message,
)


async def read_message(reader: asyncio.StreamReader) -> dict[str, Any] | None:
    line = await reader.readline()
    if not line:
        return None
    if not line.strip():
        return None
    return decode_transport_message(line)


async def write_message(
    writer: asyncio.StreamWriter,
    message: dict[str, Any],
) -> None:
    payload = encode_transport_message(message) + "\n"
    writer.write(payload.encode("utf-8"))
    await writer.drain()


async def handle_stream_connection(reader, writer, server) -> None:
    """Process messages until the stream closes."""
    try:
        while True:
            message = await read_message(reader)
            if message is None:
                break
            response = await server.handle(message)
            if response is not None:
                await write_message(writer, response)
    finally:
        writer.close()
        wait_closed = getattr(writer, "wait_closed", None)
        if wait_closed is not None:
            try:
                await wait_closed()
            except (ConnectionError, OSError):
                pass
