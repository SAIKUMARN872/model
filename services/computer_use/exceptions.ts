export class ComputerUseError extends Error {
  constructor(message: string, public readonly code = "COMPUTER_USE_ERROR") {
    super(message);
    this.name = "ComputerUseError";
  }
}

export class ValidationError extends ComputerUseError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ComputerUseError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ApprovalRequiredError extends ComputerUseError {
  constructor(message = "Approval is required for this action") {
    super(message, "APPROVAL_REQUIRED");
    this.name = "ApprovalRequiredError";
  }
}

export class InvalidStateError extends ComputerUseError {
  constructor(message: string) {
    super(message, "INVALID_STATE");
    this.name = "InvalidStateError";
  }
}
