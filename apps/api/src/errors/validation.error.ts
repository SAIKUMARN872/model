import { ApiError } from "./api.error.js";

export interface ValidationIssue {
  readonly path: readonly (string | number)[];
  readonly code: string;
  readonly message: string;
}

export class ValidationError extends ApiError {
  public readonly issues: readonly ValidationIssue[];

  constructor(
    issues: readonly ValidationIssue[] = [],
    message = "The request contains invalid fields.",
  ) {
    super(400, "VALIDATION_ERROR", message);
    this.name = "ValidationError";
    this.issues = issues.map((issue) => ({
      path: [...issue.path],
      code: issue.code,
      message: issue.message,
    }));
  }
}
