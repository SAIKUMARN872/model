export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class UserRepository {
  private users: Map<string, UserRecord> =
    new Map();

  public create(
    user: UserRecord
  ): UserRecord {
    if (!user.id) {
      throw new Error(
        "User ID is required."
      );
    }

    if (!user.email) {
      throw new Error(
        "User email is required."
      );
    }

    this.users.set(
      user.id,
      user
    );

    return user;
  }

  public findById(
    id: string
  ): UserRecord | undefined {
    return this.users.get(id);
  }

  public findByEmail(
    email: string
  ): UserRecord | undefined {
    return Array.from(
      this.users.values()
    ).find(
      (user) =>
        user.email.toLowerCase() ===
        email.toLowerCase()
    );
  }

  public findAll(): UserRecord[] {
    return Array.from(
      this.users.values()
    );
  }

  public findActive(): UserRecord[] {
    return this.findAll().filter(
      (user) => user.isActive
    );
  }

  public update(
    id: string,
    updates: Partial<UserRecord>
  ): UserRecord | undefined {
    const existing =
      this.users.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: UserRecord = {
      ...existing,
      ...updates,
      id,
      updatedAt:
        new Date().toISOString(),
    };

    this.users.set(
      id,
      updated
    );

    return updated;
  }

  public delete(
    id: string
  ): boolean {
    return this.users.delete(id);
  }

  public activate(
    id: string
  ): UserRecord | undefined {
    return this.update(id, {
      isActive: true,
    });
  }

  public deactivate(
    id: string
  ): UserRecord | undefined {
    return this.update(id, {
      isActive: false,
    });
  }

  public exists(
    id: string
  ): boolean {
    return this.users.has(id);
  }

  public count(): number {
    return this.users.size;
  }

  public clear(): void {
    this.users.clear();
  }
}

const userRepository =
  new UserRepository();

export default userRepository;