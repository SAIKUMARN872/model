from collections.abc import Iterable

BROWSER_EXECUTE_PERMISSION = "browser:execute"


class BrowserPermissionError(PermissionError):
    """The caller is not authorized to execute browser tasks."""


def require_browser_permission(
    user_id: str | None,
    permissions: Iterable[str] | None,
    required_permission: str = BROWSER_EXECUTE_PERMISSION,
) -> None:
    """Fail closed unless the caller has the exact required permission."""
    if not isinstance(user_id, str) or not user_id.strip():
        raise BrowserPermissionError("A trusted user identity is required.")

    if (
        permissions is None
        or isinstance(permissions, (str, bytes))
        or not isinstance(permissions, Iterable)
    ):
        raise BrowserPermissionError(
            "Explicit browser permissions must be a collection of permission strings."
        )

    if not isinstance(required_permission, str) or not required_permission.strip():
        raise BrowserPermissionError("A valid required permission is required.")

    try:
        permission_items = tuple(permissions)
    except (TypeError, ValueError) as exc:
        raise BrowserPermissionError(
            "Browser permissions could not be validated."
        ) from exc

    if any(
        not isinstance(permission, str) or not permission.strip()
        for permission in permission_items
    ):
        raise BrowserPermissionError(
            "Every browser permission must be a non-empty string."
        )

    granted = set(permission_items)
    if required_permission not in granted:
        raise BrowserPermissionError(
            f"Missing required permission: {required_permission}"
        )
