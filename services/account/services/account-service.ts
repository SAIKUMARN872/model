import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from "../schemas/account-schema.js";
import type {
  AccountRepository,
} from "../repository/account-repository.js";
import { AccountEventBus } from "../events/account-events.js";

export class AccountService {
  constructor(
    private readonly repository: AccountRepository,
    private readonly events: AccountEventBus,
  ) {}

  async create(input: CreateAccountInput): Promise<Account> {
    this.validateEmail(input.email);
    this.validateName(input.name);

    const existing = await this.repository.findByEmail(input.email);

    if (existing) {
      throw new Error("An account with this email already exists");
    }

    const account = await this.repository.create(input);

    this.events.publish("account.created", account);

    return account;
  }

  async getById(id: string): Promise<Account> {
    const account = await this.repository.findById(id);

    if (!account) {
      throw new Error("Account not found");
    }

    return account;
  }

  async getByEmail(email: string): Promise<Account> {
    const account = await this.repository.findByEmail(email);

    if (!account) {
      throw new Error("Account not found");
    }

    return account;
  }

  async update(
    id: string,
    input: UpdateAccountInput,
  ): Promise<Account> {
    if (input.email) {
      this.validateEmail(input.email);

      const existing = await this.repository.findByEmail(input.email);

      if (existing && existing.id !== id) {
        throw new Error("An account with this email already exists");
      }
    }

    if (input.name !== undefined) {
      this.validateName(input.name);
    }

    const account = await this.repository.update(id, input);

    if (!account) {
      throw new Error("Account not found");
    }

    this.events.publish("account.updated", account);

    return account;
  }

  async delete(id: string): Promise<void> {
    const account = await this.repository.findById(id);

    if (!account) {
      throw new Error("Account not found");
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new Error("Unable to delete account");
    }

    this.events.publish("account.deleted", {
      id: account.id,
      email: account.email,
    });
  }

  async list(): Promise<Account[]> {
    return this.repository.list();
  }

  private validateEmail(email: string): void {
    const normalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error("Invalid email address");
    }
  }

  private validateName(name: string): void {
    if (!name.trim()) {
      throw new Error("Name is required");
    }
  }
}
