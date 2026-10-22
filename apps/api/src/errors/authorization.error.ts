import { ApiError } from "./api.error.js";

export class AuthorizationError extends ApiError {
  constructor(message = "You are not authorized to perform this action.") {
    super(403, "FORBIDDEN", message);
    this.name = "AuthorizationError";
  }
}

export class InsufficientPermissionsError extends ApiError {
  constructor() {
    super(403, "INSUFFICIENT_PERMISSIONS", "You do not have permission to perform this action.");
    this.name = "InsufficientPermissionsError";
  }
}
