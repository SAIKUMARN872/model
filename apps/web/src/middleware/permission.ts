import auth from "../lib/auth";

export const hasPermission = (permission: string): boolean => {
  const user = auth.getUser<any>();

  if (!user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  const permissions: string[] = user.permissions || [];

  return permissions.includes(permission);
};

export default hasPermission;