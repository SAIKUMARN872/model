"""Live, read-only smoke tests for selected ModelNow connectors.

This script does not load .env automatically and never prints credentials
or provider response data. Configure environment variables in the shell
before running it.
"""

import asyncio
import importlib.util
import os


def report(name, status, detail):
    print(f"{status:7} | {name:18} | {detail}")


def missing_env(*names):
    return [name for name in names if not os.environ.get(name)]


async def run_connector(name, operation, connector, credentials, arguments=None):
    from ai.connectors.models import ConnectorRequest

    try:
        result = await connector.execute(
            ConnectorRequest(operation, arguments or {}),
            credentials,
        )
        if result.success:
            report(name, "PASS", f"{operation} succeeded")
        else:
            # Provider errors are intentionally not printed because
            # upstream libraries can sometimes include sensitive details.
            report(name, "FAIL", f"{operation} returned an error")
    except Exception:
        report(name, "FAIL", f"{operation} raised an exception")


async def test_github():
    if not os.environ.get("GITHUB_TOKEN"):
        report("github", "BLOCKED", "GITHUB_TOKEN is not configured")
        return

    try:
        from ai.connectors.github.config import GitHubConnectorConfig
        from ai.connectors.github.connector import GitHubConnector
        from ai.connectors.github.tools import create_github_client

        config = GitHubConnectorConfig()
        connector = GitHubConnector(config, create_github_client(config))
        await run_connector(
            "github", "get_authenticated_user", connector,
            {"token": os.environ["GITHUB_TOKEN"]},
        )
    except ImportError:
        report("github", "BLOCKED", "Required project dependency is unavailable")
    except Exception:
        report("github", "FAIL", "Connector initialization failed")


async def test_google_calendar():
    if not os.environ.get("GOOGLE_CALENDAR_ACCESS_TOKEN"):
        report("google_calendar", "BLOCKED",
               "GOOGLE_CALENDAR_ACCESS_TOKEN is not configured")
        return

    try:
        from ai.connectors.google_calendar.config import GoogleCalendarConnectorConfig
        from ai.connectors.google_calendar.connector import GoogleCalendarConnector
        from ai.connectors.google_calendar.tools import create_google_calendar_client

        config = GoogleCalendarConnectorConfig()
        connector = GoogleCalendarConnector(
            config, create_google_calendar_client(config)
        )
        await run_connector(
            "google_calendar", "list_calendars", connector,
            {"access_token": os.environ["GOOGLE_CALENDAR_ACCESS_TOKEN"]},
            {"maxResults": 1},
        )
    except ImportError:
        report("google_calendar", "BLOCKED",
               "Required project dependency is unavailable")
    except Exception:
        report("google_calendar", "FAIL", "Connector initialization failed")


async def test_mongodb():
    required = missing_env("MONGODB_URI", "MONGODB_DATABASE")
    if required:
        report("mongodb", "BLOCKED", "Missing: " + ", ".join(required))
        return
    if importlib.util.find_spec("pymongo") is None:
        report("mongodb", "BLOCKED", "Install pymongo in the active environment")
        return

    client = None
    try:
        from ai.connectors.mongodb.config import create_mongodb_config
        from ai.connectors.mongodb.tools import create_mongodb_client
        from ai.connectors.mongodb.connector import MongoDBConnector

        config = create_mongodb_config(os.environ["MONGODB_DATABASE"])
        client = create_mongodb_client(
            config, {"uri": os.environ["MONGODB_URI"]}
        )
        connector = MongoDBConnector(config, client)
        await run_connector(
            "mongodb", "list_collections", connector,
            {"uri": os.environ["MONGODB_URI"]},
        )
    except ImportError:
        report("mongodb", "BLOCKED", "MongoDB driver unavailable")
    except Exception:
        report("mongodb", "FAIL", "MongoDB initialization failed")
    finally:
        if client is not None:
            try:
                client.close()
            except Exception:
                pass


async def test_mysql():
    required = missing_env(
        "MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"
    )
    if required:
        report("mysql", "BLOCKED", "Missing: " + ", ".join(required))
        return
    if importlib.util.find_spec("mysql") is None:
        report("mysql", "BLOCKED",
               "Install mysql-connector-python in the active environment")
        return

    try:
        from ai.connectors.mysql.config import create_mysql_config
        from ai.connectors.mysql.client import MySQLClient
        from ai.connectors.mysql.connector import MySQLConnector

        config = create_mysql_config(os.environ["MYSQL_DATABASE"])
        client = MySQLClient.from_environment(config)
        connector = MySQLConnector(config, client)
        await run_connector("mysql", "list_tables", connector, {})
    except ImportError:
        report("mysql", "BLOCKED", "MySQL driver unavailable")
    except Exception:
        report("mysql", "FAIL", "MySQL initialization failed")


async def test_postgres():
    required = missing_env(
        "POSTGRES_HOST", "POSTGRES_USER", "POSTGRES_PASSWORD",
        "POSTGRES_DATABASE",
    )
    if required:
        report("postgres", "BLOCKED", "Missing: " + ", ".join(required))
        return
    if importlib.util.find_spec("psycopg") is None:
        report("postgres", "BLOCKED",
               "Install psycopg[binary] in the active environment")
        return

    try:
        from ai.connectors.postgres.config import create_postgres_config
        from ai.connectors.postgres.client import PostgreSQLClient
        from ai.connectors.postgres.connector import PostgreSQLConnector

        config = create_postgres_config(os.environ["POSTGRES_DATABASE"])
        client = PostgreSQLClient.from_environment(config)
        connector = PostgreSQLConnector(config, client)
        await run_connector("postgres", "list_tables", connector, {})
    except ImportError:
        report("postgres", "BLOCKED", "PostgreSQL driver unavailable")
    except Exception:
        report("postgres", "FAIL", "PostgreSQL initialization failed")


async def test_redis():
    if not os.environ.get("REDIS_URL"):
        report("redis", "BLOCKED", "REDIS_URL is not configured")
        return
    if importlib.util.find_spec("redis") is None:
        report("redis", "BLOCKED", "Install redis in the active environment")
        return

    try:
        from ai.connectors.redis.config import create_redis_config
        from ai.connectors.redis.client import RedisClient
        from ai.connectors.redis.connector import RedisConnector

        config = create_redis_config()
        client = RedisClient.from_environment(config)
        connector = RedisConnector(config, client)
        await run_connector("redis", "ping", connector, {})
    except ImportError:
        report("redis", "BLOCKED", "Redis driver unavailable")
    except Exception:
        report("redis", "FAIL", "Redis initialization failed")


async def main():
    print("ModelNow live connector smoke tests (read-only)")
    print("-" * 66)
    for test in (
        test_github,
        test_google_calendar,
        test_mongodb,
        test_mysql,
        test_postgres,
        test_redis,
    ):
        await test()
    print("-" * 66)
    print("PASS means a real read-only operation succeeded.")
    print("BLOCKED means prerequisites are missing; it is not a pass.")


if __name__ == "__main__":
    asyncio.run(main())
