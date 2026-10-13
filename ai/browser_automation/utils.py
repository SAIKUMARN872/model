from datetime import datetime, timezone
from uuid import uuid4


def new_task_id() -> str:
    return str(uuid4())


def timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()
