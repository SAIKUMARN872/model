class PromptManagementError(Exception):
    """Base error for Prompt Management."""


class PromptValidationError(PromptManagementError, ValueError):
    """A prompt or its variables are invalid."""


class PromptNotFoundError(PromptManagementError, LookupError):
    """The prompt does not exist in the requested tenant."""


class PromptConflictError(PromptManagementError):
    """An operation conflicts with the prompt lifecycle."""


class MissingPromptVariablesError(PromptValidationError):
    """Required template variables were not supplied."""

    def __init__(self, missing):
        self.missing = tuple(sorted(missing))
        super().__init__(
            "Missing required prompt variables: " + ", ".join(self.missing)
        )
