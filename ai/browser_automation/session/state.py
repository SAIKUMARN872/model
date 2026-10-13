from enum import Enum


class SessionState(str, Enum):
    CREATED = "created"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"
    EXPIRED = "expired"
    FAILED = "failed"


ALLOWED_TRANSITIONS = {
    SessionState.CREATED: {
        SessionState.ACTIVE,
        SessionState.CLOSED,
        SessionState.FAILED,
    },
    SessionState.ACTIVE: {
        SessionState.PAUSED,
        SessionState.CLOSED,
        SessionState.FAILED,
    },
    SessionState.PAUSED: {
        SessionState.ACTIVE,
        SessionState.CLOSED,
        SessionState.FAILED,
    },
    SessionState.FAILED: {
        SessionState.CLOSED,
    },
    SessionState.CLOSED: set(),
    SessionState.EXPIRED: set(),
}
