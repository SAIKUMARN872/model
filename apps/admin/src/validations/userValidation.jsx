/**
 * User Validation Utilities
 * Admin Dashboard
 */

const VALID_USER_ROLES = [
  "super_admin",
  "admin",
  "manager",
  "auditor",
  "viewer",
];

const VALID_USER_STATUSES = [
  "active",
  "inactive",
  "suspended",
];

/**
 * Validate user name.
 */
export const validateUserName = (name) => {
  if (
    !name ||
    typeof name !== "string" ||
    name.trim() === ""
  ) {
    return {
      isValid: false,
      error: "User name is required.",
    };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error:
        "User name must contain at least 2 characters.",
    };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      error:
        "User name cannot exceed 100 characters.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate user email.
 */
export const validateUserEmail = (email) => {
  if (
    !email ||
    typeof email !== "string"
  ) {
    return {
      isValid: false,
      error: "Email address is required.",
    };
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return {
      isValid: false,
      error:
        "Please enter a valid email address.",
    };
  }

  if (normalizedEmail.length > 254) {
    return {
      isValid: false,
      error:
        "Email address is too long.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate user role.
 */
export const validateUserRole = (role) => {
  if (!VALID_USER_ROLES.includes(role)) {
    return {
      isValid: false,
      error: "Invalid user role.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate user status.
 */
export const validateUserStatus = (
  status
) => {
  if (
    !VALID_USER_STATUSES.includes(status)
  ) {
    return {
      isValid: false,
      error: "Invalid user status.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate user phone number.
 */
export const validateUserPhone = (phone) => {
  if (!phone) {
    return {
      isValid: true,
      error: null,
    };
  }

  const normalizedPhone =
    String(phone).replace(
      /[\s\-().]/g,
      ""
    );

  if (
    !/^\+?[0-9]{7,15}$/.test(
      normalizedPhone
    )
  ) {
    return {
      isValid: false,
      error:
        "Please enter a valid phone number.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate user avatar URL.
 */
export const validateUserAvatarUrl = (
  avatarUrl
) => {
  if (!avatarUrl) {
    return {
      isValid: true,
      error: null,
    };
  }

  try {
    const url = new URL(avatarUrl);

    if (
      !["http:", "https:"].includes(
        url.protocol
      )
    ) {
      throw new Error(
        "Invalid protocol"
      );
    }

    return {
      isValid: true,
      error: null,
    };
  } catch {
    return {
      isValid: false,
      error:
        "Please enter a valid avatar URL.",
    };
  }
};

/**
 * Validate user password.
 */
export const validateUserPassword = (
  password
) => {
  if (
    !password ||
    typeof password !== "string"
  ) {
    return {
      isValid: false,
      error: "Password is required.",
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error:
        "Password must contain at least 8 characters.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error:
        "Password must contain at least one uppercase letter.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error:
        "Password must contain at least one lowercase letter.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error:
        "Password must contain at least one number.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate password confirmation.
 */
export const validatePasswordConfirmation = (
  password,
  confirmPassword
) => {
  if (!confirmPassword) {
    return {
      isValid: false,
      error:
        "Password confirmation is required.",
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error:
        "Passwords do not match.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate user creation form.
 */
export const validateCreateUser = (user) => {
  const errors = {};

  const nameValidation =
    validateUserName(user?.name);

  if (!nameValidation.isValid) {
    errors.name =
      nameValidation.error;
  }

  const emailValidation =
    validateUserEmail(user?.email);

  if (!emailValidation.isValid) {
    errors.email =
      emailValidation.error;
  }

  const roleValidation =
    validateUserRole(user?.role);

  if (!roleValidation.isValid) {
    errors.role =
      roleValidation.error;
  }

  const statusValidation =
    validateUserStatus(user?.status);

  if (!statusValidation.isValid) {
    errors.status =
      statusValidation.error;
  }

  const phoneValidation =
    validateUserPhone(user?.phone);

  if (!phoneValidation.isValid) {
    errors.phone =
      phoneValidation.error;
  }

  const avatarValidation =
    validateUserAvatarUrl(
      user?.avatarUrl
    );

  if (!avatarValidation.isValid) {
    errors.avatarUrl =
      avatarValidation.error;
  }

  if (user?.password) {
    const passwordValidation =
      validateUserPassword(
        user.password
      );

    if (!passwordValidation.isValid) {
      errors.password =
        passwordValidation.error;
    }

    if (
      user?.confirmPassword !==
      undefined
    ) {
      const confirmationValidation =
        validatePasswordConfirmation(
          user.password,
          user.confirmPassword
        );

      if (
        !confirmationValidation.isValid
      ) {
        errors.confirmPassword =
          confirmationValidation.error;
      }
    }
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate user update form.
 */
export const validateUpdateUser = (
  user
) => {
  const errors = {};

  const nameValidation =
    validateUserName(user?.name);

  if (!nameValidation.isValid) {
    errors.name =
      nameValidation.error;
  }

  const emailValidation =
    validateUserEmail(user?.email);

  if (!emailValidation.isValid) {
    errors.email =
      emailValidation.error;
  }

  const roleValidation =
    validateUserRole(user?.role);

  if (!roleValidation.isValid) {
    errors.role =
      roleValidation.error;
  }

  const statusValidation =
    validateUserStatus(user?.status);

  if (!statusValidation.isValid) {
    errors.status =
      statusValidation.error;
  }

  if (user?.phone) {
    const phoneValidation =
      validateUserPhone(user.phone);

    if (!phoneValidation.isValid) {
      errors.phone =
        phoneValidation.error;
    }
  }

  if (user?.avatarUrl) {
    const avatarValidation =
      validateUserAvatarUrl(
        user.avatarUrl
      );

    if (!avatarValidation.isValid) {
      errors.avatarUrl =
        avatarValidation.error;
    }
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Check if user is active.
 */
export const isUserActive = (user) => {
  return (
    user?.status === "active"
  );
};

/**
 * Check if user is suspended.
 */
export const isUserSuspended = (
  user
) => {
  return (
    user?.status === "suspended"
  );
};

/**
 * Check if user has administrator privileges.
 */
export const isAdminUser = (user) => {
  return [
    "super_admin",
    "admin",
  ].includes(user?.role);
};

/**
 * Check if user is a super administrator.
 */
export const isSuperAdmin = (user) => {
  return (
    user?.role === "super_admin"
  );
};

/**
 * Check whether a user can be deleted.
 */
export const canDeleteUser = (user) => {
  if (!user) {
    return false;
  }

  // Prevent deleting a super admin.
  if (
    user.role === "super_admin"
  ) {
    return false;
  }

  return true;
};

/**
 * Export supported roles and statuses.
 */
export {
  VALID_USER_ROLES,
  VALID_USER_STATUSES,
};