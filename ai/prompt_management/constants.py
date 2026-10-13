from enum import StrEnum

MAX_PROMPT_NAME_LENGTH = 128
MAX_TEMPLATE_LENGTH = 50_000
MAX_VARIABLES = 100


class PromptStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
