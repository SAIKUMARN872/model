export class AgentsError extends Error {
  constructor(
    message: string,
    public readonly code: string = "AGENTS_ERROR",
  ) {
    super(message);
    this.name = "AgentsError";
  }
}

export class ValidationError extends AgentsError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AgentsError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AgentsError {
  constructor(message: string) {
    super(message, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class InvalidStateError extends AgentsError {
  constructor(message: string) {
    super(message, "INVALID_STATE");
    this.name = "InvalidStateError";
  }
}

