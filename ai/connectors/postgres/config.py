"""PostgreSQL connector configuration."""
from __future__ import annotations

from dataclasses import dataclass
import re

_NAME = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,62}$")
_ENV = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


@dataclass(frozen=True, slots=True)
class PostgreSQLConfig:
    database: str
    schema: str = "public"
    host_env_var: str = "POSTGRES_HOST"
    user_env_var: str = "POSTGRES_USER"
    password_env_var: str = "POSTGRES_PASSWORD"
    port_env_var: str = "POSTGRES_PORT"
    timeout_seconds: int = 10
    max_rows: int = 100
    required_permissions: tuple[str, ...] = ("postgres:read",)

    def __post_init__(self):
        for field_name in ("database", "schema"):
            value = getattr(self, field_name)
            if not isinstance(value, str) or not _NAME.fullmatch(value):
                raise ValueError(f"Invalid PostgreSQL {field_name}")
        for field_name in (
            "host_env_var", "user_env_var", "password_env_var", "port_env_var"
        ):
            value = getattr(self, field_name)
            if not isinstance(value, str) or not _ENV.fullmatch(value):
                raise ValueError(f"Invalid environment variable name: {field_name}")
        if isinstance(self.timeout_seconds, bool) or not isinstance(self.timeout_seconds, int) or not 1 <= self.timeout_seconds <= 120:
            raise ValueError("timeout_seconds must be from 1 to 120")
        if isinstance(self.max_rows, bool) or not isinstance(self.max_rows, int) or not 1 <= self.max_rows <= 100:
            raise ValueError("max_rows must be from 1 to 100")
        if not isinstance(self.required_permissions, tuple) or not self.required_permissions:
            raise ValueError("required_permissions must be a non-empty tuple")


def create_postgres_config(database, **kwargs):
    return PostgreSQLConfig(database=database, **kwargs)
