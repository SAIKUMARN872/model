from enum import Enum


class ActionDomain(str, Enum):
    SHOPPING = "shopping"
    FOOD = "food"
    TRAVEL = "travel"
    BOOKING = "booking"
    CHECKOUT = "checkout"
    ENTERPRISE = "enterprise"


class ActionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    AWAITING_APPROVAL = "awaiting_approval"
    COMPLETED = "completed"
    FAILED = "failed"
