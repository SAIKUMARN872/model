"""MySQL connector configuration."""

from dataclasses import dataclass
import re


_NAME = re.compile(r"^[A-Za-z0-9_]{1,64}$")


@dataclass(frozen=True, slots=True)
class MySQLConfig:
    database: str
    host_env_var: str = "MYSQL_HOST"
    user_env_var: str = "MYSQL_USER"
    password_env_var: str = "MYSQL_PASSWORD"
    port_env_var: str = "MYSQL_PORT"
    timeout_seconds: int = 10
    max_rows: int = 100
    required_permissions: tuple[str, ...] = ("mysql:read",)

    def __post_init__(self):
        if not isinstance(self.database, str) or not _NAME.fullmatch(self.database):
            raise ValueError("Invalid MySQL database name")
        for field_name in (
            "host_env_var", "user_env_var", "password_env_var", "port_env_var"
        ):
            value = getattr(self, field_name)
            if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", value):
                raise ValueError(f"Invalid environment variable name: {field_name}")
        if isinstance(self.timeout_seconds, bool) or not 1 <= self.timeout_seconds <= 120:
            raise ValueError("timeout_seconds must be from 1 to 120")
        if isinstance(self.max_rows, bool) or not 1 <= self.max_rows <= 100:
            raise ValueError("max_rows must be from 1 to 100")
        if not self.required_permissions:
            raise ValueError("required_permissions cannot be empty")


def create_mysql_config(database, **kwargs):
    return MySQLConfig(database=database, **kwargs)
