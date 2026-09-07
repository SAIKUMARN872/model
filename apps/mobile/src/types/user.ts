export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_USER: User = {
  id: "",
  name: "",
  email: "",
  role: "user",
  avatar: "",
  isActive: true,
  createdAt: "",
  updatedAt: "",
};

export function createUser(
  user: User
): User {
  return {
    ...user,
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
  return user.isActive;
}

export function activateUser(
  user: User
): User {
  return {
    ...user,
    isActive: true,
    updatedAt:
      new Date().toISOString(),
  };
}

export function deactivateUser(
  user: User
): User {
  return {
    ...user,
    isActive: false,
    updatedAt:
      new Date().toISOString(),
  };
}

export default DEFAULT_USER;