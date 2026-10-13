export type Permission =
    | "auth:read"
    | "auth:write"
    | "users:read"
    | "users:write"
    | "sessions:read"
    | "sessions:write"
    | "admin:all"

export interface PermissionSet {
    permissions: Permission[]
}
