/**
 * Organization Validation Utilities
 * Admin Dashboard
 */

const VALID_ORGANIZATION_STATUSES = [
  "active",
  "inactive",
  "suspended",
];

const VALID_PLANS = [
  "free",
  "starter",
  "professional",
  "enterprise",
];

/**
 * Validate organization name.
 */
export const validateOrganizationName = (
  name
) => {
  if (
    !name ||
    typeof name !== "string" ||
    name.trim() === ""
  ) {
    return {
      isValid: false,
      error:
        "Organization name is required.",
    };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error:
        "Organization name must contain at least 2 characters.",
    };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      error:
        "Organization name cannot exceed 100 characters.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate organization slug.
 *
 * Example:
 * acme-corporation
 */
export const validateOrganizationSlug = (
  slug
) => {
  if (
    !slug ||
    typeof slug !== "string" ||
    slug.trim() === ""
  ) {
    return {
      isValid: false,
      error:
        "Organization slug is required.",
    };
  }

  const normalizedSlug =
    slug.trim().toLowerCase();

  if (
    normalizedSlug.length < 2 ||
    normalizedSlug.length > 50
  ) {
    return {
      isValid: false,
      error:
        "Slug must contain between 2 and 50 characters.",
    };
  }

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      normalizedSlug
    )
  ) {
    return {
      isValid: false,
      error:
        "Slug can only contain lowercase letters, numbers, and hyphens.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate organization email.
 */
export const validateOrganizationEmail = (
  email
) => {
  if (!email) {
    return {
      isValid: true,
      error: null,
    };
  }

  if (
    typeof email !== "string"
  ) {
    return {
      isValid: false,
      error:
        "Email address is invalid.",
    };
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailRegex.test(email.trim())
  ) {
    return {
      isValid: false,
      error:
        "Please enter a valid email address.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate organization phone number.
 */
export const validateOrganizationPhone = (
  phone
) => {
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
 * Validate organization status.
 */
export const validateOrganizationStatus = (
  status
) => {
  if (
    !VALID_ORGANIZATION_STATUSES.includes(
      status
    )
  ) {
    return {
      isValid: false,
      error:
        "Invalid organization status.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate organization plan.
 */
export const validateOrganizationPlan = (
  plan
) => {
  if (!VALID_PLANS.includes(plan)) {
    return {
      isValid: false,
      error:
        "Invalid organization plan.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate organization website.
 */
export const validateOrganizationWebsite = (
  website
) => {
  if (!website) {
    return {
      isValid: true,
      error: null,
    };
  }

  try {
    const url = new URL(website);

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
        "Please enter a valid website URL.",
    };
  }
};

/**
 * Validate organization description.
 */
export const validateOrganizationDescription = (
  description
) => {
  if (!description) {
    return {
      isValid: true,
      error: null,
    };
  }

  if (
    typeof description !== "string"
  ) {
    return {
      isValid: false,
      error:
        "Description must be text.",
    };
  }

  if (description.trim().length > 500) {
    return {
      isValid: false,
      error:
        "Description cannot exceed 500 characters.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate organization creation form.
 */
export const validateCreateOrganization = (
  organization
) => {
  const errors = {};

  const nameValidation =
    validateOrganizationName(
      organization?.name
    );

  if (!nameValidation.isValid) {
    errors.name =
      nameValidation.error;
  }

  const slugValidation =
    validateOrganizationSlug(
      organization?.slug
    );

  if (!slugValidation.isValid) {
    errors.slug =
      slugValidation.error;
  }

  const emailValidation =
    validateOrganizationEmail(
      organization?.email
    );

  if (!emailValidation.isValid) {
    errors.email =
      emailValidation.error;
  }

  const phoneValidation =
    validateOrganizationPhone(
      organization?.phone
    );

  if (!phoneValidation.isValid) {
    errors.phone =
      phoneValidation.error;
  }

  const websiteValidation =
    validateOrganizationWebsite(
      organization?.website
    );

  if (!websiteValidation.isValid) {
    errors.website =
      websiteValidation.error;
  }

  const descriptionValidation =
    validateOrganizationDescription(
      organization?.description
    );

  if (
    !descriptionValidation.isValid
  ) {
    errors.description =
      descriptionValidation.error;
  }

  if (organization?.status) {
    const statusValidation =
      validateOrganizationStatus(
        organization.status
      );

    if (!statusValidation.isValid) {
      errors.status =
        statusValidation.error;
    }
  }

  if (organization?.plan) {
    const planValidation =
      validateOrganizationPlan(
        organization.plan
      );

    if (!planValidation.isValid) {
      errors.plan =
        planValidation.error;
    }
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate organization update form.
 */
export const validateUpdateOrganization = (
  organization
) => {
  return validateCreateOrganization(
    organization
  );
};

/**
 * Check whether an organization is active.
 */
export const isOrganizationActive = (
  organization
) => {
  if (!organization) {
    return false;
  }

  return (
    organization.status === "active"
  );
};

/**
 * Check whether an organization is suspended.
 */
export const isOrganizationSuspended = (
  organization
) => {
  if (!organization) {
    return false;
  }

  return (
    organization.status ===
    "suspended"
  );
};

/**
 * Export supported organization statuses.
 */
export {
  VALID_ORGANIZATION_STATUSES,
  VALID_PLANS,
};