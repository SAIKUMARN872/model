import hashlib
import re
import uuid


def new_id() -> str:
    return str(uuid.uuid4())


def stable_id(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def safe_collection_name(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]", "_", value)
    cleaned = cleaned.strip("_-") or "default"
    return ("mn_" + cleaned)[:60]


def chunk_text(
    text: str, chunk_size: int = 1200, overlap: int = 200
) -> list[str]:
    text = re.sub(r"\r\n?", "\n", text).strip()
    if not text:
        return []
    if chunk_size < 1 or overlap < 0 or overlap >= chunk_size:
        raise ValueError("Require chunk_size > overlap >= 0.")

    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        if end < len(text):
            boundary = text.rfind("\n", start + chunk_size // 2, end)
            if boundary > start:
                end = boundary
        piece = text[start:end].strip()
        if piece:
            chunks.append(piece)
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return chunks
