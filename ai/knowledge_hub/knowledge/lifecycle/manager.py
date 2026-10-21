from pathlib import Path

from .policies import LifecyclePolicy


class LifecycleManager:
    def __init__(self, policy=None):
        self.policy = policy or LifecyclePolicy()

    def validate_file(self, file_path: str) -> Path:
        path = Path(file_path).expanduser().resolve()
        if not path.is_file():
            raise FileNotFoundError(str(path))
        if path.suffix.lower() not in self.policy.allowed_extensions:
            raise ValueError("Unsupported document extension")
        if path.stat().st_size > self.policy.max_file_size_bytes:
            raise ValueError("Document exceeds the upload size limit")
        if path.stat().st_size == 0:
            raise ValueError("Document is empty")
        return path
