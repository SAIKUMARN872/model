"use client";

import PermissionMatrix from "./permissions/PermissionMatrix";
import RoleManager from "./roles/RoleManager";
import UserAccess from "./users/UserAccess";

export default function RBACPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          Role Based Access Control
        </h1>

        <p className="mt-2 text-gray-500">
          Manage roles, permissions and user access across the
          platform.
        </p>
      </div>

      <RoleManager />

      <PermissionMatrix />

      <UserAccess />
    </div>
  );
}