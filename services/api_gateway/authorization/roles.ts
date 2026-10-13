export interface Role {
  name: string;
  permissions: string[];
}

export const defaultRoles: Role[] = [
  {
    name: "viewer",
    permissions: ["read"],
  },
  {
    name: "operator",
    permissions: ["read", "write", "execute"],
  },
  {
    name: "admin",
    permissions: [
      "read",
      "write",
      "delete",
      "execute",
      "admin",
    ],
  },
];
