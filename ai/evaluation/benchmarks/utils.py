"""Shared benchmark validation helpers."""
import math


def validate_nonempty_text(value, name):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} must be a non-empty string")
    return value


def validate_document_list(value, name):
    if isinstance(value, (str, bytes)) or not isinstance(value, (list, tuple)):
        raise ValueError(f"{name} must be a list or tuple of document IDs")
    for document in value:
        if not isinstance(document, str) or not document.strip():
            raise ValueError(f"{name} must contain non-empty string document IDs")
    return list(value)


def safe_ratio(numerator, denominator):
    if denominator == 0:
        return 0.0
    return numerator / denominator


def validate_positive_duration(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("duration_seconds must be a positive finite number")
    if not math.isfinite(value) or value <= 0:
        raise ValueError("duration_seconds must be a positive finite number")
    return float(value)
