from ..models import BrowserTask
from ..schemas import validate_task, validate_url


def validate_browser_task(task: BrowserTask) -> BrowserTask:
    """Validate a task using the package's existing validation rules."""
    validate_task(task)
    return task


def validate_navigation_url(url: str) -> str:
    """Validate a destination before browser navigation."""
    return validate_url(url)
