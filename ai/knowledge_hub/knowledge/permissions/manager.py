from threading import RLock


class PermissionManager:
    def __init__(self):
        self._policies = {}
        self._lock = RLock()

    def grant(self, principal_id, collection_id, permissions):
        allowed = {"read", "upload", "delete", "manage"}
        permissions = set(permissions)
        if not principal_id or not collection_id:
            raise ValueError("Principal and collection are required")
        if not permissions or not permissions.issubset(allowed):
            raise ValueError("Invalid permissions")

        with self._lock:
            self._policies[(principal_id, collection_id)] = permissions

    def revoke(self, principal_id, collection_id):
        with self._lock:
            return self._policies.pop(
                (principal_id, collection_id), None
            ) is not None

    def allows(self, principal_id, collection_id, permission):
        with self._lock:
            permissions = self._policies.get(
                (principal_id, collection_id), set()
            )
            return permission in permissions or "manage" in permissions

    def require(self, principal_id, collection_id, permission):
        from ..exceptions import KnowledgePermissionError
        if not self.allows(principal_id, collection_id, permission):
            raise KnowledgePermissionError(
                f"Access denied: {permission} on {collection_id}"
            )
