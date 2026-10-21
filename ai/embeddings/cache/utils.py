"""Embedding cache key and serialization utilities."""

import hashlib
import json
import math
from collections.abc import Sequence


def validate_cache_text(text):
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Cache text must be a non-empty string")
    return text


def make_cache_key(
    model_name,
    text,
    *,
    normalize=True,
    dimensions=None,
    namespace="modelnow:embeddings",
    version=1,
):
    """Create a stable key isolated by model and embedding configuration."""
    if not isinstance(model_name, str) or not model_name.strip():
        raise ValueError("model_name must be a non-empty string")
    validate_cache_text(text)

    if not isinstance(normalize, bool):
        raise ValueError("normalize must be a boolean")
    if dimensions is not None and (
        not isinstance(dimensions, int)
        or isinstance(dimensions, bool)
        or dimensions < 1
    ):
        raise ValueError("dimensions must be a positive integer or None")
    if not isinstance(namespace, str) or not namespace.strip():
        raise ValueError("namespace must be a non-empty string")
    if not isinstance(version, int) or isinstance(version, bool) or version < 1:
        raise ValueError("version must be a positive integer")

    payload = {
        "version": version,
        "model": model_name.strip(),
        "text": text,
        "normalize": normalize,
        "dimensions": dimensions,
    }
    canonical = json.dumps(
        payload, sort_keys=True, ensure_ascii=False, separators=(",", ":")
    ).encode("utf-8")
    digest = hashlib.sha256(canonical).hexdigest()
    return f"{namespace.strip().rstrip(':')}:v{version}:{digest}"


def validate_embedding(vector, expected_dimension=None):
    if not isinstance(vector, (list, tuple)) or not vector:
        raise ValueError("Embedding must be a non-empty list or tuple")

    result = []
    for value in vector:
        if isinstance(value, bool):
            raise ValueError("Embedding values must be numeric, not boolean")
        try:
            number = float(value)
        except (TypeError, ValueError, OverflowError) as exc:
            raise ValueError("Embedding values must be numeric") from exc
        if not math.isfinite(number):
            raise ValueError("Embedding values must be finite")
        result.append(number)

    if expected_dimension is not None and len(result) != expected_dimension:
        raise ValueError(
            f"Embedding dimension mismatch: expected {expected_dimension}, "
            f"received {len(result)}"
        )
    return result


def serialize_embedding(vector):
    validated = validate_embedding(vector)
    return json.dumps(
        {"schema_version": 1, "embedding": validated},
        separators=(",", ":"),
        allow_nan=False,
    )


def deserialize_embedding(payload, expected_dimension=None):
    if not isinstance(payload, (str, bytes, bytearray)):
        raise ValueError("Serialized embedding must be text or bytes")
    try:
        data = json.loads(payload)
    except (UnicodeDecodeError, json.JSONDecodeError, TypeError) as exc:
        raise ValueError("Serialized embedding is invalid JSON") from exc

    if not isinstance(data, dict) or data.get("schema_version") != 1:
        raise ValueError("Unsupported embedding cache schema")
    if "embedding" not in data:
        raise ValueError("Serialized embedding is missing its vector")

    return validate_embedding(data["embedding"], expected_dimension)
