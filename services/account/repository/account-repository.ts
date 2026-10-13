import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from "../schemas/account-schema.js";

export interface AccountRepository {
  create(input: CreateAccountInput): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  update(id: string, input: UpdateAccountInput): Promise<Account | null>;
  delete(id: string): Promise<boolean>;
  list(): Promise<Account[]>;
}

export class InMemoryAccountRepository implements AccountRepository {
  private readonly accounts = new Map<string, Account>();

  async create(input: CreateAccountInput): Promise<Account> {
    const now = new Date().toISOString();

    const account: Account = {
      id: crypto.randomUUID(),
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      status: "active",
      plan: input.plan ?? "free",
      credits: input.credits ?? 500,
      createdAt: now,
      updatedAt: now,
    };

    this.accounts.set(account.id, account);

    return { ...account };
  }

  async findById(id: string): Promise<Account | null> {
    const account = this.accounts.get(id);

    return account ? { ...account } : null;
  }

  async findByEmail(email: string): Promise<Account | null> {
    const normalizedEmail = email.trim().toLowerCase();

    for (const account of this.accounts.values()) {
      if (account.email === normalizedEmail) {
        return { ...account };
      }
    }

    return null;
  }

  async update(
    id: string,
    input: UpdateAccountInput,
  ): Promise<Account | null> {
    const existing = this.accounts.get(id);

    if (!existing) {
      return null;
    }

    const updated: Account = {
      ...existing,
      ...input,
      email: input.email
        ? input.email.trim().toLowerCase()
        : existing.email,
      name: input.name
        ? input.name.trim()
        : existing.name,
      updatedAt: new Date().toISOString(),
    };

    this.accounts.set(id, updated);

    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.accounts.delete(id);
  }

  async list(): Promise<Account[]> {
    return Array.from(this.accounts.values()).map((account) => ({
      ...account,
    }));
  }
}
