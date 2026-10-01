
import { randomUUID } from "node:crypto";

export interface AccountRecord {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface CreateAccountInput {
  userId: string;
  [key: string]: unknown;
}

export interface UpdateAccountInput {
  [key: string]: unknown;
}

export interface ServiceError {
  code: string;
  message: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
}

export interface AccountHealth {
  status: "healthy";
  totalAccounts: number;
}

function cloneAccount(account: AccountRecord): AccountRecord {
  return {
    ...structuredClone(account),
    createdAt: new Date(account.createdAt),
    updatedAt: new Date(account.updatedAt),
  };
}

function failure<T>(
  code: string,
  message: string,
): ServiceResult<T> {
  return {
    success: false,
    error: { code, message },
  };
}

function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

export class AccountService {
  private readonly accounts = new Map<string, AccountRecord>();

  /**
   * Create a new account.
   */
  async create(
    input: CreateAccountInput,
  ): Promise<ServiceResult<AccountRecord>> {
    if (!isPlainObject(input)) {
      return failure(
        "INVALID_INPUT",
        "Account input must be a valid object.",
      );
    }

    if (
      typeof input.userId !== "string" ||
      input.userId.trim().length === 0
    ) {
      return failure(
        "INVALID_USER_ID",
        "A valid userId is required.",
      );
    }

    const userId = input.userId.trim();

    const existing = [...this.accounts.values()].find(
      (account) => account.userId === userId,
    );

    if (existing) {
      return failure(
        "ACCOUNT_ALREADY_EXISTS",
        "An account already exists for this user.",
      );
    }

    const now = new Date();

    const account: AccountRecord = {
      ...structuredClone(input),
      id: randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
    };

    this.accounts.set(account.id, account);

    return {
      success: true,
      data: cloneAccount(account),
    };
  }

  /**
   * Retrieve an account by its ID.
   */
  async getById(
    id: string,
  ): Promise<ServiceResult<AccountRecord>> {
    if (!id?.trim()) {
      return failure(
        "INVALID_ID",
        "A valid account ID is required.",
      );
    }

    const account = this.accounts.get(id.trim());

    if (!account) {
      return failure(
        "ACCOUNT_NOT_FOUND",
        "Account was not found.",
      );
    }

    return {
      success: true,
      data: cloneAccount(account),
    };
  }

  /**
   * Retrieve an account by user ID.
   */
  async getByUserId(
    userId: string,
  ): Promise<ServiceResult<AccountRecord>> {
    if (!userId?.trim()) {
      return failure(
        "INVALID_USER_ID",
        "A valid userId is required.",
      );
    }

    const account = [...this.accounts.values()].find(
      (item) => item.userId === userId.trim(),
    );

    if (!account) {
      return failure(
        "ACCOUNT_NOT_FOUND",
        "No account exists for this user.",
      );
    }

    return {
      success: true,
      data: cloneAccount(account),
    };
  }

  /**
   * Retrieve all accounts.
   */
  async list(): Promise<ServiceResult<AccountRecord[]>> {
    return {
      success: true,
      data: [...this.accounts.values()].map(cloneAccount),
    };
  }

  /**
   * Update an existing account.
   */
  async update(
    id: string,
    input: UpdateAccountInput,
  ): Promise<ServiceResult<AccountRecord>> {
    if (!id?.trim()) {
      return failure(
        "INVALID_ID",
        "A valid account ID is required.",
      );
    }

    if (!isPlainObject(input)) {
      return failure(
        "INVALID_INPUT",
        "Update input must be a valid object.",
      );
    }

    const accountId = id.trim();
    const existing = this.accounts.get(accountId);

    if (!existing) {
      return failure(
        "ACCOUNT_NOT_FOUND",
        "Account was not found.",
      );
    }

    // Prevent modification of immutable system fields.
    const {
      id: ignoredId,
      userId: ignoredUserId,
      createdAt: ignoredCreatedAt,
      updatedAt: ignoredUpdatedAt,
      ...safeUpdates
    } = input;

    void ignoredId;
    void ignoredUserId;
    void ignoredCreatedAt;
    void ignoredUpdatedAt;

    const updated: AccountRecord = {
      ...existing,
      ...structuredClone(safeUpdates),
      id: existing.id,
      userId: existing.userId,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.accounts.set(accountId, updated);

    return {
      success: true,
      data: cloneAccount(updated),
    };
  }

  /**
   * Delete an account.
   */
  async delete(
    id: string,
  ): Promise<ServiceResult<boolean>> {
    if (!id?.trim()) {
      return failure(
        "INVALID_ID",
        "A valid account ID is required.",
      );
    }

    const accountId = id.trim();

    if (!this.accounts.has(accountId)) {
      return failure(
        "ACCOUNT_NOT_FOUND",
        "Account was not found.",
      );
    }

    this.accounts.delete(accountId);

    return {
      success: true,
      data: true,
    };
  }

  /**
   * Check whether an account exists.
   */
  async exists(id: string): Promise<boolean> {
    if (!id?.trim()) {
      return false;
    }

    return this.accounts.has(id.trim());
  }

  /**
   * Return the total number of accounts.
   */
  async count(): Promise<number> {
    return this.accounts.size;
  }

  /**
   * Remove all accounts.
   * Intended for testing or controlled maintenance.
   */
  async clear(): Promise<void> {
    this.accounts.clear();
  }

  /**
   * Service health check.
   */
  async healthCheck(): Promise<
    ServiceResult<AccountHealth>
  > {
    return {
      success: true,
      data: {
        status: "healthy",
        totalAccounts: this.accounts.size,
      },
    };
  }
}

/**
 * Shared account service instance.
 */
export const accountService = new AccountService();
