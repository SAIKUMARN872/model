from __future__ import annotations

SUPPORTED_LANGUAGES = {
    "python": "python",
    "py": "python",
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "java": "java",
    "c": "c",
    "cpp": "cpp",
    "c++": "cpp",
    "csharp": "csharp",
    "c#": "csharp",
    "go": "go",
    "rust": "rust",
    "ruby": "ruby",
    "php": "php",
    "sql": "sql",
    "bash": "bash",
    "shell": "bash",
}


def validate_coding_request(prompt: str) -> str:
    if not isinstance(prompt, str):
        raise TypeError("coding prompt must be a string")

    prompt = prompt.strip()

    if not prompt:
        raise ValueError("coding prompt must not be empty")

    if len(prompt) > 50_000:
        raise ValueError("coding prompt exceeds the 50000-character limit")

    return prompt


def detect_language(value: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("language must be a non-empty string")

    normalized = value.strip().lower()

    if normalized not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported language: {value}")

    return SUPPORTED_LANGUAGES[normalized]


__all__ = [
    "SUPPORTED_LANGUAGES",
    "detect_language",
    "validate_coding_request",
]
