export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function createUser(
  data: Omit<
    User,
    "createdAt" | "updatedAt"
  >
): User {
  const now =
    new Date().toISOString();

  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateUser(
  user: User,
  updates: Partial<User>
): User {
  return {
    ...user,
    ...updates,
    id: user.id,
    updatedAt:
      new Date().toISOString(),
  };
}

export function isUserActive(
  user: User
): boolean {
  return user.isActive !== false;
}

export function activateUser(
  user: User
): User {
  return updateUser(user, {
    isActive: true,
  });
}

export function deactivateUser(
  user: User
): User {
  return updateUser(user, {
    isActive: false,
  });
}