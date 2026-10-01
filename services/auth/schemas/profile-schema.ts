export interface ProfileSchema {
  id: string;
  userId: string;
  firstName: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileSchema {
  userId: string;
  firstName: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateProfileSchema {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
}

export interface ProfileSchemaValidationIssue {
  field: string;
  message: string;
}

export interface ProfileSchemaValidationResult<T> {
  valid: boolean;
  data?: T;
  errors: ProfileSchemaValidationIssue[];
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isStringRecord(
  value: unknown,
): value is Record<string, unknown> {
  return isRecord(value);
}

function validateOptionalString(
  value: unknown,
  field: string,
  errors: ProfileSchemaValidationIssue[],
): void {
  if (
    value !== undefined &&
    typeof value !== "string"
  ) {
    errors.push({
      field,
      message: `${field} must be a string`,
    });
  }
}

export function validateCreateProfile(
  input: unknown,
): ProfileSchemaValidationResult<CreateProfileSchema> {
  const errors: ProfileSchemaValidationIssue[] = [];

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
    typeof input.firstName !== "string" ||
    input.firstName.trim().length === 0
  ) {
    errors.push({
      field: "firstName",
      message: "First name is required",
    });
  }

  validateOptionalString(
    input.lastName,
    "lastName",
    errors,
  );

  validateOptionalString(
    input.displayName,
    "displayName",
    errors,
  );

  validateOptionalString(
    input.phone,
    "phone",
    errors,
  );

  validateOptionalString(
    input.avatarUrl,
    "avatarUrl",
    errors,
  );

  validateOptionalString(
    input.bio,
    "bio",
    errors,
  );

  if (
    input.metadata !== undefined &&
    !isStringRecord(input.metadata)
  ) {
    errors.push({
      field: "metadata",
      message: "Metadata must be an object",
    });
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  const data: CreateProfileSchema = {
    userId: (input.userId as string).trim(),
    firstName: (input.firstName as string).trim(),
    lastName:
      input.lastName !== undefined
        ? (input.lastName as string).trim()
        : undefined,
    displayName:
      input.displayName !== undefined
        ? (input.displayName as string).trim()
        : undefined,
    phone:
      input.phone !== undefined
        ? (input.phone as string).trim()
        : undefined,
    avatarUrl:
      input.avatarUrl !== undefined
        ? (input.avatarUrl as string).trim()
        : undefined,
    bio:
      input.bio !== undefined
        ? (input.bio as string).trim()
        : undefined,
    metadata: {
      ...((input.metadata as Record<
        string,
        unknown
      > | undefined) ?? {}),
    },
  };

  return {
    valid: true,
    data,
    errors: [],
  };
}

export function validateUpdateProfile(
  input: unknown,
): ProfileSchemaValidationResult<UpdateProfileSchema> {
  const errors: ProfileSchemaValidationIssue[] = [];

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

  validateOptionalString(
    input.firstName,
    "firstName",
    errors,
  );

  validateOptionalString(
    input.lastName,
    "lastName",
    errors,
  );

  validateOptionalString(
    input.displayName,
    "displayName",
    errors,
  );

  validateOptionalString(
    input.phone,
    "phone",
    errors,
  );

  validateOptionalString(
    input.avatarUrl,
    "avatarUrl",
    errors,
  );

  validateOptionalString(
    input.bio,
    "bio",
    errors,
  );

  if (
    input.firstName !== undefined &&
    typeof input.firstName === "string" &&
    input.firstName.trim().length === 0
  ) {
    errors.push({
      field: "firstName",
      message: "First name cannot be empty",
    });
  }

  if (
    input.metadata !== undefined &&
    !isStringRecord(input.metadata)
  ) {
    errors.push({
      field: "metadata",
      message: "Metadata must be an object",
    });
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  const data: UpdateProfileSchema = {
    firstName:
      input.firstName !== undefined
        ? (input.firstName as string).trim()
        : undefined,
    lastName:
      input.lastName !== undefined
        ? (input.lastName as string).trim()
        : undefined,
    displayName:
      input.displayName !== undefined
        ? (input.displayName as string).trim()
        : undefined,
    phone:
      input.phone !== undefined
        ? (input.phone as string).trim()
        : undefined,
    avatarUrl:
      input.avatarUrl !== undefined
        ? (input.avatarUrl as string).trim()
        : undefined,
    bio:
      input.bio !== undefined
        ? (input.bio as string).trim()
        : undefined,
    metadata:
      input.metadata !== undefined
        ? {
            ...(input.metadata as Record<
              string,
              unknown
            >),
          }
        : undefined,
  };

  return {
    valid: true,
    data,
    errors: [],
  };
}

export function validateProfile(
  input: unknown,
): ProfileSchemaValidationResult<ProfileSchema> {
  const errors: ProfileSchemaValidationIssue[] = [];

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
      message: "Profile ID is required",
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

  if (
    typeof input.firstName !== "string" ||
    input.firstName.trim().length === 0
  ) {
    errors.push({
      field: "firstName",
      message: "First name is required",
    });
  }

  validateOptionalString(
    input.lastName,
    "lastName",
    errors,
  );

  validateOptionalString(
    input.displayName,
    "displayName",
    errors,
  );

  validateOptionalString(
    input.phone,
    "phone",
    errors,
  );

  validateOptionalString(
    input.avatarUrl,
    "avatarUrl",
    errors,
  );

  validateOptionalString(
    input.bio,
    "bio",
    errors,
  );

  if (!isStringRecord(input.metadata)) {
    errors.push({
      field: "metadata",
      message: "Metadata must be an object",
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

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  const data: ProfileSchema = {
    id: (input.id as string).trim(),
    userId: (input.userId as string).trim(),
    firstName: (input.firstName as string).trim(),
    lastName:
      input.lastName !== undefined
        ? (input.lastName as string).trim()
        : undefined,
    displayName:
      input.displayName !== undefined
        ? (input.displayName as string).trim()
        : undefined,
    phone:
      input.phone !== undefined
        ? (input.phone as string).trim()
        : undefined,
    avatarUrl:
      input.avatarUrl !== undefined
        ? (input.avatarUrl as string).trim()
        : undefined,
    bio:
      input.bio !== undefined
        ? (input.bio as string).trim()
        : undefined,
    metadata: {
      ...(input.metadata as Record<
        string,
        unknown
      >),
    },
    createdAt: new Date(
      (input.createdAt as Date).getTime(),
    ),
    updatedAt: new Date(
      (input.updatedAt as Date).getTime(),
    ),
  };

  return {
    valid: true,
    data,
    errors: [],
  };
}

export function isValidProfile(
  input: unknown,
): input is ProfileSchema {
  return validateProfile(input).valid;
}

export function isValidCreateProfile(
  input: unknown,
): input is CreateProfileSchema {
  return validateCreateProfile(input).valid;
}

export function isValidUpdateProfile(
  input: unknown,
): input is UpdateProfileSchema {
  return validateUpdateProfile(input).valid;
}

export function assertValidProfile(
  input: unknown,
): asserts input is ProfileSchema {
  const result = validateProfile(input);

  if (!result.valid) {
    throw new Error(
      `Invalid profile: ${result.errors
        .map(
          (error) =>
            `${error.field}: ${error.message}`,
        )
        .join("; ")}`,
    );
  }
}
