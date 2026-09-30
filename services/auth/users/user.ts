import { randomUUID } from "node:crypto";

export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  status: UserStatus;
  roles: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash?: string;
  status?: UserStatus;
  roles?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  passwordHash?: string;
  status?: UserStatus;
  roles?: string[];
  metadata?: Record<string, unknown>;
  lastLoginAt?: Date;
}

function cloneUser(user: User): User {
  return {
    ...user,
    roles: [...user.roles],
    metadata: { ...user.metadata },
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    ...(user.lastLoginAt
      ? { lastLoginAt: new Date(user.lastLoginAt) }
      : {}),
  };
}

export class UserService {
  private readonly users = new Map<string, User>();

  create(input: CreateUserInput): User {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();

    if (!email) {
      throw new Error("Email is required");
    }

    if (!name) {
      throw new Error("Name is required");
    }

    if (this.findByEmailInternal(email)) {
      throw new Error(`User already exists: ${email}`);
    }

    const now = new Date();

    const user: User = {
      id: randomUUID(),
      email,
      name,
      passwordHash: input.passwordHash,
      status: input.status ?? "active",
      roles: [...(input.roles ?? [])],
      metadata: { ...(input.metadata ?? {}) },
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);

    return cloneUser(user);
  }

  getById(id: string): User | undefined {
    const user = this.users.get(id);
    return user ? cloneUser(user) : undefined;
  }

  getRequiredById(id: string): User {
    const user = this.getById(id);

    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    return user;
  }

  findByEmail(email: string): User | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.findByEmailInternal(normalizedEmail);

    return user ? cloneUser(user) : undefined;
  }

  getRequiredByEmail(email: string): User {
    const user = this.findByEmail(email);

    if (!user) {
      throw new Error(`User not found: ${email}`);
    }

    return user;
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
      const email = input.email.trim().toLowerCase();

      if (!email) {
        throw new Error("Email cannot be empty");
      }

      const existing = this.findByEmailInternal(email);

      if (existing && existing.id !== id) {
        throw new Error(`User already exists: ${email}`);
      }

      user.email = email;
    }

    if (input.name !== undefined) {
      const name = input.name.trim();

      if (!name) {
        throw new Error("Name cannot be empty");
      }

      user.name = name;
    }

    if (input.passwordHash !== undefined) {
      user.passwordHash = input.passwordHash;
    }

    if (input.status !== undefined) {
      user.status = input.status;
    }

    if (input.roles !== undefined) {
      user.roles = [...input.roles];
    }

    if (input.metadata !== undefined) {
      user.metadata = { ...input.metadata };
    }

    if (input.lastLoginAt !== undefined) {
      user.lastLoginAt = new Date(input.lastLoginAt);
    }

    user.updatedAt = new Date();

    return cloneUser(user);
  }

  delete(id: string): boolean {
    return this.users.delete(id);
  }

  activate(id: string): User {
    return this.update(id, { status: "active" });
  }

  deactivate(id: string): User {
    return this.update(id, { status: "inactive" });
  }

  suspend(id: string): User {
    return this.update(id, { status: "suspended" });
  }

  setRoles(id: string, roles: string[]): User {
    return this.update(id, { roles });
  }

  addRole(id: string, role: string): User {
    const user = this.getRequiredById(id);

    if (!role.trim()) {
      throw new Error("Role is required");
    }

    if (user.roles.includes(role)) {
      return user;
    }

    return this.update(id, {
      roles: [...user.roles, role],
    });
  }

  removeRole(id: string, role: string): User {
    const user = this.getRequiredById(id);

    return this.update(id, {
      roles: user.roles.filter((item) => item !== role),
    });
  }

  hasRole(id: string, role: string): boolean {
    const user = this.getById(id);

    return user?.roles.includes(role) ?? false;
  }

  recordLogin(id: string): User {
    return this.update(id, {
      lastLoginAt: new Date(),
    });
  }

  count(): number {
    return this.users.size;
  }

  countByStatus(status: UserStatus): number {
    return this.list().filter((user) => user.status === status).length;
  }

  clear(): void {
    this.users.clear();
  }

  health(): {
    healthy: boolean;
    userCount: number;
  } {
    return {
      healthy: true,
      userCount: this.users.size,
    };
  }

  private findByEmailInternal(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }

    return undefined;
  }
}

export const userService = new UserService();
