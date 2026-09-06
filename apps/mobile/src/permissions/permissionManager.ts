export interface Permission {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
}

export class PermissionManager {
  private permissions: Map<
    string,
    Permission
  > = new Map();

  public create(
    id: string,
    name: string,
    description?: string
  ): Permission {
    if (!id.trim()) {
      throw new Error(
        "Permission ID is required."
      );
    }

    if (!name.trim()) {
      throw new Error(
        "Permission name is required."
      );
    }

    const permission: Permission = {
      id,
      name,
      description,
      enabled: true,
    };

    this.permissions.set(
      id,
      permission
    );

    return permission;
  }

  public get(
    id: string
  ): Permission | undefined {
    return this.permissions.get(id);
  }

  public getAll(): Permission[] {
    return Array.from(
      this.permissions.values()
    );
  }

  public has(
    id: string
  ): boolean {
    return this.permissions.has(id);
  }

  public isEnabled(
    id: string
  ): boolean {
    const permission =
      this.permissions.get(id);

    return permission?.enabled === true;
  }

  public enable(
    id: string
  ): boolean {
    const permission =
      this.permissions.get(id);

    if (!permission) {
      return false;
    }

    permission.enabled = true;

    return true;
  }

  public disable(
    id: string
  ): boolean {
    const permission =
      this.permissions.get(id);

    if (!permission) {
      return false;
    }

    permission.enabled = false;

    return true;
  }

  public remove(
    id: string
  ): boolean {
    return this.permissions.delete(id);
  }

  public clear(): void {
    this.permissions.clear();
  }

  public count(): number {
    return this.permissions.size;
  }
}

const permissionManager =
  new PermissionManager();

export default permissionManager;