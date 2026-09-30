import type { CreateUserInput, UpdateUserInput, User } from "./user.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface UserValidationOptions {
  minNameLength?: number;
  maxNameLength?: number;
  maxEmailLength?: number;
}

export class UserValidator {
  private readonly options: Required<UserValidationOptions>;

  constructor(options: UserValidationOptions = {}) {
    this.options = {
      minNameLength: options.minNameLength ?? 2,
      maxNameLength: options.maxNameLength ?? 100,
      maxEmailLength: options.maxEmailLength ?? 254,
    };
  }

  validateEmail(email: string): boolean {
    const value = email.trim();

    if (!value || value.length > this.options.maxEmailLength) {
      return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  validateName(name: string): boolean {
    const value = name.trim();

    return (
      value.length >= this.options.minNameLength &&
      value.length <= this.options.maxNameLength
    );
  }

  validateCreate(input: CreateUserInput): ValidationResult {
    const errors: string[] = [];

    if (!this.validateEmail(input.email)) {
      errors.push("Invalid email address");
    }

    if (!this.validateName(input.name)) {
      errors.push("Invalid name");
    }

    if (input.passwordHash !== undefined && !input.passwordHash.trim()) {
      errors.push("Password hash cannot be empty");
    }

    if (input.roles !== undefined) {
      if (input.roles.some((role) => !role.trim())) {
        errors.push("Roles cannot contain empty values");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateUpdate(input: UpdateUserInput): ValidationResult {
    const errors: string[] = [];

    if (input.email !== undefined && !this.validateEmail(input.email)) {
      errors.push("Invalid email address");
    }

    if (input.name !== undefined && !this.validateName(input.name)) {
      errors.push("Invalid name");
    }

    if (input.passwordHash !== undefined && !input.passwordHash.trim()) {
      errors.push("Password hash cannot be empty");
    }

    if (input.roles !== undefined) {
      if (input.roles.some((role) => !role.trim())) {
        errors.push("Roles cannot contain empty values");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateUser(user: User): ValidationResult {
    return this.validateCreate({
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      roles: user.roles,
      metadata: user.metadata,
      status: user.status,
    });
  }

  assertCreate(input: CreateUserInput): void {
    const result = this.validateCreate(input);

    if (!result.valid) {
      throw new Error(result.errors.join("; "));
    }
  }

  assertUpdate(input: UpdateUserInput): void {
    const result = this.validateUpdate(input);

    if (!result.valid) {
      throw new Error(result.errors.join("; "));
    }
  }
}

export const userValidator = new UserValidator();
