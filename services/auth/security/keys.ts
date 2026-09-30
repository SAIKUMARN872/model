import {
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";

export type KeyType =
  | "api"
  | "encryption"
  | "signing"
  | "refresh";

export interface SecurityKey {
  id: string;
  name: string;
  type: KeyType;
  value: string;
  hash: string;
  active: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface CreateKeyInput {
  name: string;
  type: KeyType;
  expiresInSeconds?: number;
}

export class KeyService {
  private readonly keys = new Map<string, SecurityKey>();

  create(input: CreateKeyInput): SecurityKey {
    const name = input.name.trim();

    if (!name) {
      throw new Error("Key name is required");
    }

    if (input.expiresInSeconds !== undefined && input.expiresInSeconds <= 0) {
      throw new Error("expiresInSeconds must be greater than zero");
    }

    const value = randomBytes(32).toString("hex");

    const expiresAt =
      input.expiresInSeconds !== undefined
        ? new Date(Date.now() + input.expiresInSeconds * 1000)
        : undefined;

    const key: SecurityKey = {
      id: randomUUID(),
      name,
      type: input.type,
      value,
      hash: this.hash(value),
      active: true,
      createdAt: new Date(),
      expiresAt,
    };

    this.keys.set(key.id, this.clone(key));

    return this.clone(key);
  }

  get(id: string): SecurityKey | undefined {
    const key = this.keys.get(id);

    return key ? this.clone(key) : undefined;
  }

  list(): SecurityKey[] {
    return [...this.keys.values()].map((key) => this.clone(key));
  }

  getActive(): SecurityKey[] {
    return this.list().filter((key) => this.isActive(key));
  }

  revoke(id: string): boolean {
    const key = this.keys.get(id);

    if (!key) {
      return false;
    }

    key.active = false;
    this.keys.set(id, this.clone(key));

    return true;
  }

  delete(id: string): boolean {
    return this.keys.delete(id);
  }

  verify(id: string, value: string): boolean {
    const key = this.keys.get(id);

    if (!key || !this.isActive(key)) {
      return false;
    }

    return this.hash(value) === key.hash;
  }

  count(): number {
    return this.keys.size;
  }

  clear(): void {
    this.keys.clear();
  }

  health(): {
    healthy: boolean;
    keyCount: number;
    activeKeyCount: number;
  } {
    return {
      healthy: true,
      keyCount: this.keys.size,
      activeKeyCount: this.getActive().length,
    };
  }

  private hash(value: string): string {
    return createHash("sha256")
      .update(value, "utf8")
      .digest("hex");
  }

  private isActive(key: SecurityKey): boolean {
    if (!key.active) {
      return false;
    }

    if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) {
      return false;
    }

    return true;
  }

  private clone(key: SecurityKey): SecurityKey {
    return {
      ...key,
      createdAt: new Date(key.createdAt),
      expiresAt: key.expiresAt
        ? new Date(key.expiresAt)
        : undefined,
    };
  }
}

export const keyService = new KeyService();
