/**
 * Validation utilities
 * Admin Dashboard
 */

/**
 * Check if a value is empty.
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
};

/**
 * Validate an email address.
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email.trim());
};

/**
 * Validate a password.
 *
 * Requirements:
 * - At least 8 characters
 * - One uppercase letter
 * - One lowercase letter
 * - One number
 */
export const isValidPassword = (password) => {
  if (!password || typeof password !== "string") {
    return false;
  }

  if (password.length < 8) {
    return false;
  }

  if (!/[A-Z]/.test(password)) {
    return false;
  }

  if (!/[a-z]/.test(password)) {
    return false;
  }

  if (!/[0-9]/.test(password)) {
    return false;
  }

  return true;
};

/**
 * Validate password confirmation.
 */
export const passwordsMatch = (
  password,
  confirmPassword
) => {
  return (
    isRequired(password) &&
    password === confirmPassword
  );
};

/**
 * Validate a username.
 */
export const isValidUsername = (
  username
) => {
  if (
    !username ||
    typeof username !== "string"
  ) {
    return false;
  }

  return /^[a-zA-Z0-9_]{3,30}$/.test(
    username
  );
};

/**
 * Validate a phone number.
 */
export const isValidPhone = (phone) => {
  if (!phone) {
    return false;
  }

  const normalizedPhone =
    String(phone).replace(
      /[\s\-().]/g,
      ""
    );

  return /^\+?[0-9]{7,15}$/.test(
    normalizedPhone
  );
};

/**
 * Validate a URL.
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate a number range.
 */
export const isInRange = (
  value,
  min,
  max
) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return false;
  }

  return (
    number >= min &&
    number <= max
  );
};

/**
 * Validate a positive number.
 */
export const isPositiveNumber = (
  value
) => {
  const number = Number(value);

  return (
    !Number.isNaN(number) &&
    number > 0
  );
};

/**
 * Validate a non-negative number.
 */
export const isNonNegativeNumber = (
  value
) => {
  const number = Number(value);

  return (
    !Number.isNaN(number) &&
    number >= 0
  );
};

/**
 * Validate an integer.
 */
export const isInteger = (value) => {
  const number = Number(value);

  return (
    !Number.isNaN(number) &&
    Number.isInteger(number)
  );
};

/**
 * Validate a date.
 */
export const isValidDate = (value) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(
    date.getTime()
  );
};

/**
 * Validate a date range.
 */
export const isValidDateRange = (
  startDate,
  endDate
) => {
  if (
    !isValidDate(startDate) ||
    !isValidDate(endDate)
  ) {
    return false;
  }

  return (
    new Date(startDate).getTime() <=
    new Date(endDate).getTime()
  );
};

/**
 * Validate file size.
 *
 * maxSizeInMB = maximum allowed size.
 */
export const isValidFileSize = (
  file,
  maxSizeInMB
) => {
  if (!file) {
    return false;
  }

  const maxBytes =
    maxSizeInMB *
    1024 *
    1024;

  return file.size <= maxBytes;
};

/**
 * Validate file extension/type.
 */
export const isValidFileType = (
  file,
  allowedTypes = []
) => {
  if (!file) {
    return false;
  }

  if (
    !Array.isArray(allowedTypes) ||
    allowedTypes.length === 0
  ) {
    return true;
  }

  return allowedTypes.includes(
    file.type
  );
};

/**
 * Validate an image file.
 */
export const isValidImage = (
  file
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  return isValidFileType(
    file,
    allowedTypes
  );
};

/**
 * Validate an array.
 */
export const isValidArray = (
  value,
  minLength = 0,
  maxLength = Infinity
) => {
  if (!Array.isArray(value)) {
    return false;
  }

  return (
    value.length >= minLength &&
    value.length <= maxLength
  );
};

/**
 * Validate a string length.
 */
export const isValidLength = (
  value,
  minLength = 0,
  maxLength = Infinity
) => {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const length = value.trim().length;

  return (
    length >= minLength &&
    length <= maxLength
  );
};

/**
 * Validate an object.
 */
export const isValidObject = (
  value
) => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
};

/**
 * Validate an admin user form.
 */
export const validateAdminUser = (
  user
) => {
  const errors = {};

  if (!isRequired(user?.name)) {
    errors.name =
      "Name is required";
  }

  if (!isRequired(user?.email)) {
    errors.email =
      "Email is required";
  } else if (
    !isValidEmail(user.email)
  ) {
    errors.email =
      "Please enter a valid email address";
  }

  if (!isRequired(user?.role)) {
    errors.role =
      "Role is required";
  }

  if (!isRequired(user?.status)) {
    errors.status =
      "Status is required";
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate a team form.
 */
export const validateTeam = (
  team
) => {
  const errors = {};

  if (!isRequired(team?.name)) {
    errors.name =
      "Team name is required";
  } else if (
    !isValidLength(
      team.name,
      2,
      100
    )
  ) {
    errors.name =
      "Team name must be between 2 and 100 characters";
  }

  if (
    team?.description &&
    !isValidLength(
      team.description,
      0,
      500
    )
  ) {
    errors.description =
      "Description cannot exceed 500 characters";
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form.
 */
export const validateLogin = (
  credentials
) => {
  const errors = {};

  if (!isRequired(credentials?.email)) {
    errors.email =
      "Email is required";
  } else if (
    !isValidEmail(credentials.email)
  ) {
    errors.email =
      "Please enter a valid email address";
  }

  if (!isRequired(credentials?.password)) {
    errors.password =
      "Password is required";
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate password change form.
 */
export const validatePasswordChange = (
  data
) => {
  const errors = {};

  if (
    !isRequired(
      data?.currentPassword
    )
  ) {
    errors.currentPassword =
      "Current password is required";
  }

  if (
    !isRequired(
      data?.newPassword
    )
  ) {
    errors.newPassword =
      "New password is required";
  } else if (
    !isValidPassword(
      data.newPassword
    )
  ) {
    errors.newPassword =
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number";
  }

  if (
    !passwordsMatch(
      data?.newPassword,
      data?.confirmPassword
    )
  ) {
    errors.confirmPassword =
      "Passwords do not match";
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate a UUID.
 */
export const isValidUUID = (
  value
) => {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(value);
};

/**
 * Validate an ID.
 */
export const isValidId = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  if (
    typeof value === "string" &&
    value.trim() === ""
  ) {
    return false;
  }

  return true;
};