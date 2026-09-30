export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialCharacter: boolean;
  rejectWhitespace: boolean;
}

export const defaultPasswordPolicy: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialCharacter: true,
  rejectWhitespace: true,
};

export class PasswordValidator {
  private readonly policy: PasswordPolicy;

  constructor(
    policy: Partial<PasswordPolicy> = {},
  ) {
    this.policy = {
      ...defaultPasswordPolicy,
      ...policy,
    };
  }

  validate(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (typeof password !== "string") {
      return {
        valid: false,
        errors: ["Password must be a string"],
      };
    }

    if (password.length < this.policy.minLength) {
      errors.push(
        `Password must be at least ${this.policy.minLength} characters`,
      );
    }

    if (password.length > this.policy.maxLength) {
      errors.push(
        `Password must not exceed ${this.policy.maxLength} characters`,
      );
    }

    if (
      this.policy.rejectWhitespace &&
      /\s/.test(password)
    ) {
      errors.push("Password must not contain whitespace");
    }

    if (
      this.policy.requireUppercase &&
      !/[A-Z]/.test(password)
    ) {
      errors.push(
        "Password must contain at least one uppercase letter",
      );
    }

    if (
      this.policy.requireLowercase &&
      !/[a-z]/.test(password)
    ) {
      errors.push(
        "Password must contain at least one lowercase letter",
      );
    }

    if (
      this.policy.requireNumber &&
      !/[0-9]/.test(password)
    ) {
      errors.push(
        "Password must contain at least one number",
      );
    }

    if (
      this.policy.requireSpecialCharacter &&
      !/[^A-Za-z0-9]/.test(password)
    ) {
      errors.push(
        "Password must contain at least one special character",
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  isValid(password: string): boolean {
    return this.validate(password).valid;
  }

  getPolicy(): PasswordPolicy {
    return {
      ...this.policy,
    };
  }
}

export const passwordValidator = new PasswordValidator();
