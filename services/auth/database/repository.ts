import {
  DatabaseConnection,
  databaseConnection,
} from "./connection.js";

export interface AuthRecord {
  id: string;
  userId: string;
  email?: string;
  username?: string;
  role?: string;
  status?: "active" | "inactive" | "blocked";
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAuthRecordInput {
  userId: string;
  email?: string;
  username?: string;
  role?: string;
  status?: "active" | "inactive" | "blocked";
  metadata?: Record<string, unknown>;
}

export interface UpdateAuthRecordInput {
  email?: string;
  username?: string;
  role?: string;
  status?: "active" | "inactive" | "blocked";
  metadata?: Record<string, unknown>;
}

export class AuthRepository {
  private readonly records = new Map<string, AuthRecord>();
  private readonly connection: DatabaseConnection;

  constructor(
    connection: DatabaseConnection = databaseConnection,
  ) {
    this.connection = connection;
  }

  private ensureConnected(): void {
    if (!this.connection.isConnected()) {
      this.connection.connect();
    }
  }

  create(input: CreateAuthRecordInput): AuthRecord {
    this.ensureConnected();

    const now = new Date();

    const record: AuthRecord = {
      id: crypto.randomUUID(),
      userId: input.userId,
      email: input.email,
      username: input.username,
      role: input.role,
      status: input.status ?? "active",
      metadata: input.metadata
        ? { ...input.metadata }
        : undefined,
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(record.id, record);

    return this.clone(record);
  }

  getById(id: string): AuthRecord | undefined {
    const record = this.records.get(id);

    return record
      ? this.clone(record)
      : undefined;
  }

  getByUserId(userId: string): AuthRecord[] {
    return Array.from(this.records.values())
      .filter((record) => record.userId === userId)
      .map((record) => this.clone(record));
  }

  getByEmail(email: string): AuthRecord[] {
    return Array.from(this.records.values())
      .filter((record) => record.email === email)
      .map((record) => this.clone(record));
  }

  getAll(): AuthRecord[] {
    return Array.from(this.records.values()).map(
      (record) => this.clone(record),
    );
  }

  update(
    id: string,
    input: UpdateAuthRecordInput,
  ): AuthRecord | undefined {
    const existing = this.records.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: AuthRecord = {
      ...existing,
      ...input,
      metadata: input.metadata
        ? { ...input.metadata }
        : existing.metadata
          ? { ...existing.metadata }
          : undefined,
      updatedAt: new Date(),
    };

    this.records.set(id, updated);

    return this.clone(updated);
  }

  delete(id: string): boolean {
    return this.records.delete(id);
  }

  exists(id: string): boolean {
    return this.records.has(id);
  }

  count(): number {
    return this.records.size;
  }

  clear(): void {
    this.records.clear();
  }

  health(): {
    healthy: boolean;
    connected: boolean;
    recordCount: number;
  } {
    return {
      healthy: this.connection.isConnected(),
      connected: this.connection.isConnected(),
      recordCount: this.records.size,
    };
  }

  private clone(record: AuthRecord): AuthRecord {
    return {
      ...record,
      metadata: record.metadata
        ? { ...record.metadata }
        : undefined,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    };
  }
}

export const authRepository = new AuthRepository();
