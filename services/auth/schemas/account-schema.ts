export type AccountSchemaStatus =
  | "active"
  | "inactive"
  | "locked"
  | "suspended";

export type AccountSchemaType =
  | "user"
  | "service"
  | "admin";

export interface AccountSchema {
  id: string;
  userId: string;
  type: AccountSchemaType;
  status: AccountSchemaStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
}

export interface CreateAccountSchema {
  userId: string;
  type?: AccountSchemaType;
  status?: AccountSchemaStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UpdateAccountSchema {
  type?: AccountSchemaType;
  status?: AccountSchemaStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface SchemaValidationIssue {
  field: string;
  message: string;
}

export interface SchemaValidationResult<T> {
  valid: boolean;
  data?: T;
  errors: SchemaValidationIssue[];
}

const ACCOUNT_TYPES: readonly AccountSchemaType[] = [
  "user",
  "service",
  "admin",
];

const ACCOUNT_STATUSES: readonly AccountSchemaStatus[] = [
  "active",
  "inactive",
  "locked",
  "suspended",
];

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isAccountType(
  value: unknown,
): value is AccountSchemaType {
  return (
    typeof value === "string" &&
    ACCOUNT_TYPES.includes(
      value as AccountSchemaType,
    )
  );
}

function isAccountStatus(
  value: unknown,
): value is AccountSchemaStatus {
  return (
    typeof value === "string" &&
    ACCOUNT_STATUSES.includes(
      value as AccountSchemaStatus,
    )
  );
}

export function validateCreateAccount(
  input: unknown,
): SchemaValidationResult<CreateAccountSchema> {
  const errors: SchemaValidationIssue[] = [];

  if (!isRecord(input)) {
    return {
      valid: false,
      errors: [
        {
          field: "root",
          message: "Input must be an object",
        },
      ],
    };
  }

  if (
    typeof input.userId !== "string" ||
    input.userId.trim().length === 0
  ) {
    errors.push({
      field: "userId",
      message: "User ID is required",
    });
  }

  if (
    input.type !== undefined &&
    !isAccountType(input.type)
  ) {
    errors.push({
      field: "type",
      message:
        "Type must be user, service, or admin",
    });
  }

  if (
    input.status !== undefined &&
    !isAccountStatus(input.status)
  ) {
    errors.push({
      field: "status",
      message:
        "Status must be active, inactive, locked, or suspended",
    });
  }

  if (
    input.emailVerified !== undefined &&
    typeof input.emailVerified !== "boolean"
  ) {
    errors.push({
      field: "emailVerified",
      message: "Email verification must be boolean",
    });
  }

  if (
    input.phoneVerified !== undefined &&
    typeof input.phoneVerified !== "boolean"
  ) {
    errors.push({
      field: "phoneVerified",
      message: "Phone verification must be boolean",
    });
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  const data: CreateAccountSchema = {
    userId: (input.userId as string).trim(),
    type: input.type as
      | AccountSchemaType
      | undefined,
    status: input.status as
      | AccountSchemaStatus
      | undefined,
    emailVerified:
      input.emailVerified as boolean | undefined,
    phoneVerified:
      input.phoneVerified as boolean | undefined,
  };

  return {
    valid: true,
    data,
    errors: [],
  };
}

export function validateUpdateAccount(
  input: unknown,
): SchemaValidationResult<UpdateAccountSchema> {
  const errors: SchemaValidationIssue[] = [];

  if (!isRecord(input)) {
    return {
      valid: false,
      errors: [
        {
          field: "root",
          message: "Input must be an object",
        },
      ],
    };
  }

  if (
    input.type !== undefined &&
    !isAccountType(input.type)
  ) {
    errors.push({
      field: "type",
      message:
        "Type must be user, service, or admin",
    });
  }

  if (
    input.status !== undefined &&
    !isAccountStatus(input.status)
  ) {
    errors.push({
      field: "status",
      message:
        "Status must be active, inactive, locked, or suspended",
    });
  }

  if (
    input.emailVerified !== undefined &&
    typeof input.emailVerified !== "boolean"
  ) {
    errors.push({
      field: "emailVerified",
      message: "Email verification must be boolean",
    });
  }

  if (
    input.phoneVerified !== undefined &&
    typeof input.phoneVerified !== "boolean"
  ) {
    errors.push({
      field: "phoneVerified",
      message: "Phone verification must be boolean",
    });
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  const data: UpdateAccountSchema = {
    type: input.type as
      | AccountSchemaType
      | undefined,
    status: input.status as
      | AccountSchemaStatus
      | undefined,
    emailVerified:
      input.emailVerified as boolean | undefined,
    phoneVerified:
      input.phoneVerified as boolean | undefined,
  };

  return {
    valid: true,
    data,
    errors: [],
  };
}

export function validateAccount(
  input: unknown,
): SchemaValidationResult<AccountSchema> {
  const errors: SchemaValidationIssue[] = [];

  if (!isRecord(input)) {
    return {
      valid: false,
      errors: [
        {
          field: "root",
          message: "Input must be an object",
        },
      ],
    };
  }

  if (
    typeof input.id !== "string" ||
    input.id.trim().length === 0
  ) {
    errors.push({
      field: "id",
      message: "Account ID is required",
    });
  }

  if (
    typeof input.userId !== "string" ||
    input.userId.trim().length === 0
  ) {
    errors.push({
      field: "userId",
      message: "User ID is required",
    });
  }

  if (!isAccountType(input.type)) {
    errors.push({
      field: "type",
      message: "Invalid account type",
    });
  }

  if (!isAccountStatus(input.status)) {
    errors.push({
      field: "status",
      message: "Invalid account status",
    });
  }

  if (typeof input.emailVerified !== "boolean") {
    errors.push({
      field: "emailVerified",
      message: "Email verification must be boolean",
    });
  }

  if (typeof input.phoneVerified !== "boolean") {
    errors.push({
      field: "phoneVerified",
      message: "Phone verification must be boolean",
    });
  }

  if (!(input.createdAt instanceof Date)) {
    errors.push({
      field: "createdAt",
      message: "Created date must be a Date",
    });
  }

  if (!(input.updatedAt instanceof Date)) {
    errors.push({
      field: "updatedAt",
      message: "Updated date must be a Date",
    });
  }

  if (
    input.lastActivityAt !== undefined &&
    !(input.lastActivityAt instanceof Date)
  ) {
    errors.push({
      field: "lastActivityAt",
      message: "Last activity date must be a Date",
    });
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  const data: AccountSchema = {
    id: (input.id as string).trim(),
    userId: (input.userId as string).trim(),
    type: input.type as AccountSchemaType,
    status: input.status as AccountSchemaStatus,
    emailVerified: input.emailVerified as boolean,
    phoneVerified: input.phoneVerified as boolean,
    createdAt: new Date(
      (input.createdAt as Date).getTime(),
    ),
    updatedAt: new Date(
      (input.updatedAt as Date).getTime(),
    ),
    lastActivityAt:
      input.lastActivityAt instanceof Date
        ? new Date(input.lastActivityAt.getTime())
        : undefined,
  };

  return {
    valid: true,
    data,
    errors: [],
  };
}

export function isValidAccount(
  input: unknown,
): input is AccountSchema {
  return validateAccount(input).valid;
}

export function isValidCreateAccount(
  input: unknown,
): input is CreateAccountSchema {
  return validateCreateAccount(input).valid;
}

export function isValidUpdateAccount(
  input: unknown,
): input is UpdateAccountSchema {
  return validateUpdateAccount(input).valid;
}

export function assertValidAccount(
  input: unknown,
): asserts input is AccountSchema {
  const result = validateAccount(input);

  if (!result.valid) {
    throw new Error(
      `Invalid account: ${result.errors
        .map(
          (error) =>
            `${error.field}: ${error.message}`,
        )
        .join("; ")}`,
    );
  }
}
