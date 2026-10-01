import {
  accountService,
  type Account,
  type AccountHealth,
  type AccountStatus,
  type AccountType,
} from "../account/index.js";

export interface CreateAccountRequest {
  userId: string;
  type?: AccountType;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UpdateAccountRequest {
  type?: AccountType;
  status?: AccountStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AccountController {
  create(request: CreateAccountRequest): ApiResponse<Account> {
    try {
      const account = accountService.create(request);

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  get(id: string): ApiResponse<Account> {
    try {
      const account = accountService.get(id);

      if (!account) {
        return {
          success: false,
          error: "Account not found",
        };
      }

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  getByUserId(userId: string): ApiResponse<Account> {
    try {
      const account = accountService.getByUserId(userId);

      if (!account) {
        return {
          success: false,
          error: "Account not found",
        };
      }

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  list(): ApiResponse<Account[]> {
    try {
      return {
        success: true,
        data: accountService.list(),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  update(
    id: string,
    request: UpdateAccountRequest,
  ): ApiResponse<Account> {
    try {
      return {
        success: true,
        data: accountService.update(id, request),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  activate(id: string): ApiResponse<Account> {
    return this.changeStatus(id, "active");
  }

  deactivate(id: string): ApiResponse<Account> {
    return this.changeStatus(id, "inactive");
  }

  lock(id: string): ApiResponse<Account> {
    return this.changeStatus(id, "locked");
  }

  suspend(id: string): ApiResponse<Account> {
    return this.changeStatus(id, "suspended");
  }

  verifyEmail(id: string): ApiResponse<Account> {
    try {
      return {
        success: true,
        data: accountService.verifyEmail(id),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  verifyPhone(id: string): ApiResponse<Account> {
    try {
      return {
        success: true,
        data: accountService.verifyPhone(id),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  recordActivity(id: string): ApiResponse<Account> {
    try {
      return {
        success: true,
        data: accountService.recordActivity(id),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  delete(id: string): ApiResponse<boolean> {
    try {
      const deleted = accountService.delete(id);

      if (!deleted) {
        return {
          success: false,
          error: "Account not found",
        };
      }

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  health(): ApiResponse<AccountHealth> {
    try {
      return {
        success: true,
        data: accountService.health(),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  private changeStatus(
    id: string,
    status: AccountStatus,
  ): ApiResponse<Account> {
    try {
      let account: Account;

      switch (status) {
        case "active":
          account = accountService.activate(id);
          break;
        case "inactive":
          account = accountService.deactivate(id);
          break;
        case "locked":
          account = accountService.lock(id);
          break;
        case "suspended":
          account = accountService.suspend(id);
          break;
        default:
          throw new Error(`Unsupported account status: ${status}`);
      }

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error";
  }
}

export const accountController = new AccountController();
