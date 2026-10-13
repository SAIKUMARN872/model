from uuid import uuid4


def new_action_id() -> str:
    return str(uuid4())
