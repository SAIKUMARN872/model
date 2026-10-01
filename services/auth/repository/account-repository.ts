import { randomUUID } from "node:crypto";

export type RepositoryAccountStatus =
  | "active"
  | "inactive"
  | "locked"
  | "suspended";

export type RepositoryAccountType =
  | "user"
  | "service"
  | "admin";

export interface RepositoryAccount {
  id: string;
  userId: string;
  type: RepositoryAccountType;
  status: RepositoryAccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
}

export interface CreateAccountRepositoryInput {
  userId: string;
  type?: RepositoryAccountType;
  status?: RepositoryAccountStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UpdateAccountRepositoryInput {
  type?: RepositoryAccountType;
  status?: RepositoryAccountStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastActivityAt?: Date;
}

export interface AccountRepositoryHealth {
  healthy: boolean;
  total: number;
}

function cloneAccount(
  account: RepositoryAccount,
): RepositoryAccount {
  return {
    ...account,
    createdAt: new Date(account.createdAt),
    updatedAt: new Date(account.updatedAt),
    lastActivityAt: account.lastActivityAt
      ? new Date(account.lastActivityAt)
      : undefined,
  };
}

export class AccountRepository {
  private readonly accounts = new Map<
    string,
    RepositoryAccount
  >();

  create(
    input: CreateAccountRepositoryInput,
  ): RepositoryAccount {
    if (!input.userId?.trim()) {
      throw new Error("User ID is required");
    }

    if (this.findByUserId(input.userId)) {
      throw new Error(
        `Account already exists for user: ${input.userId}`,
      );
    }

    const now = new Date();

    const account: RepositoryAccount = {
      id: randomUUID(),
      userId: input.userId,
      type: input.type ?? "user",
      status: input.status ?? "active",
      emailVerified: input.emailVerified ?? false,
      phoneVerified: input.phoneVerified ?? false,
      createdAt: now,
      updatedAt: now,
    };

    this.accounts.set(account.id, account);

    return cloneAccount(account);
  }

  findById(
    id: string,
  ): RepositoryAccount | undefined {
    const account = this.accounts.get(id);

    return account ? cloneAccount(account) : undefined;
  }

  findRequiredById(id: string): RepositoryAccount {
    const account = this.findById(id);

    if (!account) {
      throw new Error(`Account not found: ${id}`);
    }

    return account;
  }

  findByUserId(
    userId: string,
  ): RepositoryAccount | undefined {
    for (const account of this.accounts.values()) {
      if (account.userId === userId) {
        return cloneAccount(account);
      }
    }

    return undefined;
  }

  findByStatus(
    status: RepositoryAccountStatus,
  ): RepositoryAccount[] {
    return Array.from(this.accounts.values())
      .filter((account) => account.status === status)
      .map(cloneAccount);
  }

  findAll(): RepositoryAccount[] {
    return Array.from(this.accounts.values()).map(
      cloneAccount,
    );
  }

  update(
    id: string,
    input: UpdateAccountRepositoryInput,
  ): RepositoryAccount {
    const account = this.accounts.get(id);

    if (!account) {
      throw new Error(`Account not found: ${id}`);
    }

    if (input.type !== undefined) {
      account.type = input.type;
    }

    if (input.status !== undefined) {
      account.status = input.status;
    }

    if (input.emailVerified !== undefined) {
      account.emailVerified = input.emailVerified;
    }

    if (input.phoneVerified !== undefined) {
      account.phoneVerified = input.phoneVerified;
    }

    if (input.lastActivityAt !== undefined) {
      account.lastActivityAt = new Date(
        input.lastActivityAt,
      );
    }

    account.updatedAt = new Date();

    return cloneAccount(account);
  }

  delete(id: string): boolean {
    return this.accounts.delete(id);
  }

  exists(id: string): boolean {
    return this.accounts.has(id);
  }

  count(): number {
    return this.accounts.size;
  }

  countByStatus(
    status: RepositoryAccountStatus,
  ): number {
    return this.findByStatus(status).length;
  }

  clear(): void {
    this.accounts.clear();
  }

  health(): AccountRepositoryHealth {
    return {
      healthy: true,
      total: this.accounts.size,
    };
  }
}

export const accountRepository =
  new AccountRepository();
