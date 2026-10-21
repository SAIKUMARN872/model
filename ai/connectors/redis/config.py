"""Redis connector configuration."""
from dataclasses import dataclass
import re

_ENV = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


@dataclass(frozen=True, slots=True)
class RedisConfig:
    url_env_var: str = "REDIS_URL"
    timeout_seconds: int = 10
    max_results: int = 100
    required_permissions: tuple[str, ...] = ("redis:read",)

    def __post_init__(self):
        if not isinstance(self.url_env_var, str) or not _ENV.fullmatch(self.url_env_var):
            raise ValueError("Invalid Redis URL environment variable name")
        if isinstance(self.timeout_seconds, bool) or not isinstance(self.timeout_seconds, int) or not 1 <= self.timeout_seconds <= 120:
            raise ValueError("timeout_seconds must be from 1 to 120")
        if isinstance(self.max_results, bool) or not isinstance(self.max_results, int) or not 1 <= self.max_results <= 100:
            raise ValueError("max_results must be from 1 to 100")
        if not isinstance(self.required_permissions, tuple) or not self.required_permissions:
            raise ValueError("required_permissions must be a non-empty tuple")


def create_redis_config(**kwargs):
    return RedisConfig(**kwargs)
