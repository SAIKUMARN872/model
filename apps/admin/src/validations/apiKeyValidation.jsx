/**
 * API Key Validation Utilities
 * Admin Dashboard
 */

/**
 * Validate required API key fields.
 */
export const validateApiKey = (apiKey) => {
  const errors = {};

  if (!apiKey) {
    return {
      isValid: false,
      errors: {
        form: "API key data is required.",
      },
    };
  }

  // API Key Name
  if (
    !apiKey.name ||
    apiKey.name.trim() === ""
  ) {
    errors.name =
      "API key name is required.";
  } else if (
    apiKey.name.trim().length < 3
  ) {
    errors.name =
      "API key name must contain at least 3 characters.";
  } else if (
    apiKey.name.trim().length > 100
  ) {
    errors.name =
      "API key name cannot exceed 100 characters.";
  }

  // Environment
  if (!apiKey.environment) {
    errors.environment =
      "Environment is required.";
  } else if (
    ![
      "development",
      "staging",
      "production",
    ].includes(apiKey.environment)
  ) {
    errors.environment =
      "Invalid environment.";
  }

  // Expiration
  if (
    apiKey.expiresAt &&
    !isValidDate(apiKey.expiresAt)
  ) {
    errors.expiresAt =
      "Expiration date is invalid.";
  }

  // Expiration must be in the future
  if (
    apiKey.expiresAt &&
    isValidDate(apiKey.expiresAt)
  ) {
    const expirationDate =
      new Date(apiKey.expiresAt);

    if (
      expirationDate.getTime() <=
      Date.now()
    ) {
      errors.expiresAt =
        "Expiration date must be in the future.";
    }
  }

  // Permissions
  if (
    apiKey.permissions &&
    !Array.isArray(apiKey.permissions)
  ) {
    errors.permissions =
      "Permissions must be an array.";
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate API key name only.
 */
export const validateApiKeyName = (
  name
) => {
  if (!name || name.trim() === "") {
    return {
      isValid: false,
      error: "API key name is required.",
    };
  }

  if (name.trim().length < 3) {
    return {
      isValid: false,
      error:
        "API key name must contain at least 3 characters.",
    };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      error:
        "API key name cannot exceed 100 characters.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate API key environment.
 */
export const validateApiKeyEnvironment = (
  environment
) => {
  const validEnvironments = [
    "development",
    "staging",
    "production",
  ];

  if (!environment) {
    return {
      isValid: false,
      error:
        "Environment is required.",
    };
  }

  if (
    !validEnvironments.includes(
      environment
    )
  ) {
    return {
      isValid: false,
      error:
        "Invalid API key environment.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate an API key string.
 *
 * Example formats:
 * sk_live_xxxxxxxxxxxxx
 * sk_test_xxxxxxxxxxxxx
 */
export const isValidApiKeyFormat = (
  apiKey
) => {
  if (
    !apiKey ||
    typeof apiKey !== "string"
  ) {
    return false;
  }

  const apiKeyRegex =
    /^sk_(live|test|dev)_[A-Za-z0-9_-]{16,}$/;

  return apiKeyRegex.test(
    apiKey
  );
};

/**
 * Validate API key permissions.
 */
export const validateApiKeyPermissions = (
  permissions
) => {
  if (!Array.isArray(permissions)) {
    return {
      isValid: false,
      error:
        "Permissions must be an array.",
    };
  }

  if (permissions.length === 0) {
    return {
      isValid: false,
      error:
        "At least one permission is required.",
    };
  }

  const invalidPermissions =
    permissions.filter(
      (permission) =>
        typeof permission !== "string" ||
        permission.trim() === ""
    );

  if (
    invalidPermissions.length > 0
  ) {
    return {
      isValid: false,
      error:
        "All permissions must be valid strings.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate API key expiration date.
 */
export const validateApiKeyExpiration = (
  expiresAt
) => {
  if (!expiresAt) {
    return {
      isValid: true,
      error: null,
    };
  }

  const expirationDate =
    new Date(expiresAt);

  if (
    Number.isNaN(
      expirationDate.getTime()
    )
  ) {
    return {
      isValid: false,
      error:
        "Invalid expiration date.",
    };
  }

  if (
    expirationDate.getTime() <=
    Date.now()
  ) {
    return {
      isValid: false,
      error:
        "Expiration date must be in the future.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate API key status.
 */
export const validateApiKeyStatus = (
  status
) => {
  const validStatuses = [
    "active",
    "revoked",
    "expired",
    "disabled",
  ];

  if (
    !validStatuses.includes(status)
  ) {
    return {
      isValid: false,
      error:
        "Invalid API key status.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate an API key creation form.
 */
export const validateCreateApiKeyForm = (
  formData
) => {
  const errors = {};

  const nameValidation =
    validateApiKeyName(
      formData?.name
    );

  if (!nameValidation.isValid) {
    errors.name =
      nameValidation.error;
  }

  const environmentValidation =
    validateApiKeyEnvironment(
      formData?.environment
    );

  if (
    !environmentValidation.isValid
  ) {
    errors.environment =
      environmentValidation.error;
  }

  const permissionValidation =
    validateApiKeyPermissions(
      formData?.permissions
    );

  if (
    !permissionValidation.isValid
  ) {
    errors.permissions =
      permissionValidation.error;
  }

  const expirationValidation =
    validateApiKeyExpiration(
      formData?.expiresAt
    );

  if (
    !expirationValidation.isValid
  ) {
    errors.expiresAt =
      expirationValidation.error;
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Check if an API key is expired.
 */
export const isApiKeyExpired = (
  expiresAt
) => {
  if (!expiresAt) {
    return false;
  }

  const expirationDate =
    new Date(expiresAt);

  if (
    Number.isNaN(
      expirationDate.getTime()
    )
  ) {
    return true;
  }

  return (
    expirationDate.getTime() <=
    Date.now()
  );
};

/**
 * Check if an API key is active.
 */
export const isApiKeyActive = (
  apiKey
) => {
  if (!apiKey) {
    return false;
  }

  if (
    apiKey.status !== "active"
  ) {
    return false;
  }

  if (
    isApiKeyExpired(
      apiKey.expiresAt
    )
  ) {
    return false;
  }

  return true;
};

/**
 * Validate date helper.
 */
const isValidDate = (value) => {
  const date = new Date(value);

  return !Number.isNaN(
    date.getTime()
  );
};