function generateId(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const value = (Math.random() * 16) | 0;
    const random = char === "x" ? value : (value & 0x3) | 0x8;
    return random.toString(16);
  });
}

export type AccountStatus =
  | "active"
  | "inactive"
  | "locked"
  | "suspended";

export type AccountType =
  | "user"
  | "service"
  | "admin";

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
  status?: AccountStatus;
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

function cloneAccount(account: Account): Account {
  return {
    ...account,
    createdAt: new Date(account.createdAt),
    updatedAt: new Date(account.updatedAt),
    lastActivityAt: account.lastActivityAt
      ? new Date(account.lastActivityAt)
      : undefined,
  };
}

export class AccountService {
  private readonly accounts = new Map<string, Account>();

  create(input: CreateAccountInput): Account {
    if (!input.userId?.trim()) {
      throw new Error("User ID is required");
    }

    if (this.getByUserId(input.userId)) {
      throw new Error(`Account already exists for user: ${input.userId}`);
    }

    const now = new Date();

    const account: Account = {
      id: generateId(),
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

  get(id: string): Account | undefined {
    const account = this.accounts.get(id);
    return account ? cloneAccount(account) : undefined;
  }

  getRequired(id: string): Account {
    const account = this.get(id);

    if (!account) {
      throw new Error(`Account not found: ${id}`);
    }

    return account;
  }

  getByUserId(userId: string): Account | undefined {
    for (const account of Array.from(this.accounts.values())) {
      if (account.userId === userId) {
        return cloneAccount(account);
      }
    }

    return undefined;
  }

  list(): Account[] {
    return Array.from(this.accounts.values()).map(cloneAccount);
  }

  update(id: string, input: UpdateAccountInput): Account {
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

    account.updatedAt = new Date();

    return cloneAccount(account);
  }

  activate(id: string): Account {
    return this.update(id, { status: "active" });
  }

  deactivate(id: string): Account {
    return this.update(id, { status: "inactive" });
  }

  lock(id: string): Account {
    return this.update(id, { status: "locked" });
  }

  suspend(id: string): Account {
    return this.update(id, { status: "suspended" });
  }

  verifyEmail(id: string): Account {
    return this.update(id, { emailVerified: true });
  }

  verifyPhone(id: string): Account {
    return this.update(id, { phoneVerified: true });
  }

  recordActivity(id: string): Account {
    const account = this.accounts.get(id);

    if (!account) {
      throw new Error(`Account not found: ${id}`);
    }

    const now = new Date();

    account.lastActivityAt = now;
    account.updatedAt = now;

    return cloneAccount(account);
  }

  isActive(id: string): boolean {
    const account = this.accounts.get(id);
    return account?.status === "active";
  }

  isEmailVerified(id: string): boolean {
    const account = this.accounts.get(id);
    return account?.emailVerified === true;
  }

  isPhoneVerified(id: string): boolean {
    const account = this.accounts.get(id);
    return account?.phoneVerified === true;
  }

  delete(id: string): boolean {
    return this.accounts.delete(id);
  }

  count(): number {
    return this.accounts.size;
  }

  countByStatus(status: AccountStatus): number {
    let count = 0;

    for (const account of Array.from(this.accounts.values())) {
      if (account.status === status) {
        count++;
      }
    }

    return count;
  }

  clear(): void {
    this.accounts.clear();
  }

  health(): AccountHealth {
    const total = this.count();

    return {
      healthy: true,
      total,
      active: this.countByStatus("active"),
    };
  }
}

export const accountService = new AccountService();