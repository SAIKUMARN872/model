import { randomUUID } from "node:crypto";

export type AccountType = "user" | "service";
export type AccountStatus =
  | "active"
  | "inactive"
  | "locked"
  | "suspended";

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  status: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
}

export interface CreateAccountInput {
  userId: string;
  type?: AccountType;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UpdateAccountInput {
  type?: AccountType;
  status?: AccountStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface AccountHealth {
  healthy: boolean;
  total: number;
  active: number;
}

export class AccountService {
  private readonly accounts = new Map<string, Account>();

  create(input: CreateAccountInput): Account {
    if (typeof input?.userId !== "string" || input.userId.trim() === "") {
      throw new Error("User ID is required");
    }

    if (this.getByUserId(input.userId)) {
      throw new Error("An account already exists for this user");
    }

    const now = new Date();
    const account: Account = {
      id: randomUUID(),
      userId: input.userId.trim(),
      type: input.type ?? "user",
      status: "active",
      emailVerified: input.emailVerified ?? false,
      phoneVerified: input.phoneVerified ?? false,
      createdAt: now,
      updatedAt: now,
    };

    this.accounts.set(account.id, account);
    return structuredClone(account);
  }

  get(id: string): Account | undefined {
    const account = this.accounts.get(id);
    return account ? structuredClone(account) : undefined;
  }

  getByUserId(userId: string): Account | undefined {
    const account = [...this.accounts.values()].find(
      (entry) => entry.userId === userId,
    );
    return account ? structuredClone(account) : undefined;
  }

  list(): Account[] {
    return [...this.accounts.values()].map((account) =>
      structuredClone(account),
    );
  }

  update(id: string, input: UpdateAccountInput): Account {
    const current = this.accounts.get(id);

    if (!current) {
      throw new Error("Account not found");
    }

    const updated: Account = {
      ...current,
      ...input,
      updatedAt: new Date(),
    };

    this.accounts.set(id, updated);
    return structuredClone(updated);
  }

  activate(id: string): Account {
    return this.setStatus(id, "active");
  }

  deactivate(id: string): Account {
    return this.setStatus(id, "inactive");
  }

  lock(id: string): Account {
    return this.setStatus(id, "locked");
  }

  suspend(id: string): Account {
    return this.setStatus(id, "suspended");
  }

  verifyEmail(id: string): Account {
    return this.update(id, { emailVerified: true });
  }

  verifyPhone(id: string): Account {
    return this.update(id, { phoneVerified: true });
  }

  recordActivity(id: string): Account {
    const account = this.get(id);

    if (!account) {
      throw new Error("Account not found");
    }

    account.lastActivityAt = new Date();
    account.updatedAt = new Date();
    this.accounts.set(id, account);
    return structuredClone(account);
  }

  delete(id: string): boolean {
    return this.accounts.delete(id);
  }

  health(): AccountHealth {
    const accounts = [...this.accounts.values()];
    return {
      healthy: true,
      total: accounts.length,
      active: accounts.filter((account) => account.status === "active")
        .length,
    };
  }

  clear(): void {
    this.accounts.clear();
  }

  private setStatus(id: string, status: AccountStatus): Account {
    return this.update(id, { status });
  }
}

export const accountService = new AccountService();
