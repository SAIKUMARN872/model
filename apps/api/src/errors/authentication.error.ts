import { ApiError } from "./api.error.js";

export class AuthenticationError extends ApiError {
  constructor(message = "Authentication is required.") {
    super(401, "AUTHENTICATION_REQUIRED", message);
    this.name = "AuthenticationError";
  }
}

export class InvalidCredentialsError extends ApiError {
  constructor() {
    super(401, "INVALID_CREDENTIALS", "The supplied credentials are invalid.");
    this.name = "InvalidCredentialsError";
  }
}

export class ExpiredCredentialsError extends ApiError {
  constructor() {
    super(401, "CREDENTIALS_EXPIRED", "The authentication credentials have expired.");
    this.name = "ExpiredCredentialsError";
  }
}
