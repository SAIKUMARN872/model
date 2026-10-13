export class MultimodalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MultimodalError";
  }
}

export class NotFoundError extends MultimodalError {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends MultimodalError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
