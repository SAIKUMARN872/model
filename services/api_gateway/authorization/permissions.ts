export type Permission =
  | "read"
  | "write"
  | "delete"
  | "execute"
  | "admin";

export const permissions: Permission[] = [
  "read",
  "write",
  "delete",
  "execute",
  "admin",
];
