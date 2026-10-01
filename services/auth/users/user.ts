export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  roles: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface CreateUserInput {
  id?: string;
  email: string;
  name?: string;
  status?: UserStatus;
  roles?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  status?: UserStatus;
  roles?: string[];
  metadata?: Record<string, unknown>;
}

function cloneUser(user: User): User {
  return {
    ...user,
    roles: [...user.roles],
    metadata: { ...user.metadata },
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
  };
}

export class UserService {
  private readonly users = new Map<string, User>();

  create(input: CreateUserInput): User {
    if (!input.email?.trim()) {
      throw new Error("Email is required");
    }

    if (input.id && this.users.has(input.id)) {
      throw new Error(`User already exists: ${input.id}`);
    }

    const now = new Date();
    const id = input.id ?? `user-${this.users.size + 1}`;

    const user: User = {
      id,
      email: input.email,
      name: input.name ?? "",
      status: input.status ?? "active",
      roles: input.roles ? [...input.roles] : ["user"],
      metadata: { ...(input.metadata ?? {}) },
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);

    return cloneUser(user);
  }

  getById(id: string): User | undefined {
    const user = this.users.get(id);
    return user ? cloneUser(user) : undefined;
  }

  list(): User[] {
    return Array.from(this.users.values()).map(cloneUser);
  }

  update(id: string, input: UpdateUserInput): User {
    const user = this.users.get(id);

    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    if (input.email !== undefined) {
      user.email = input.email;
    }

    if (input.name !== undefined) {
      user.name = input.name;
    }

    if (input.status !== undefined) {
      user.status = input.status;
    }

    if (input.roles !== undefined) {
      user.roles = [...input.roles];
    }

    if (input.metadata !== undefined) {
      user.metadata = { ...user.metadata, ...input.metadata };
    }

    user.updatedAt = new Date();

    return cloneUser(user);
  }

  addRole(id: string, role: string): User {
    const user = this.users.get(id);

    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    if (!user.roles.includes(role)) {
      user.roles.push(role);
      user.updatedAt = new Date();
    }

    return cloneUser(user);
  }

  removeRole(id: string, role: string): User {
    const user = this.users.get(id);

    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    user.roles = user.roles.filter((existingRole) => existingRole !== role);
    user.updatedAt = new Date();

    return cloneUser(user);
  }

  recordLogin(id: string): User {
    const user = this.users.get(id);

    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    const now = new Date();
    user.lastLoginAt = now;
    user.updatedAt = now;

    return cloneUser(user);
  }

  clear(): void {
    this.users.clear();
  }
}

export const userService = new UserService();
