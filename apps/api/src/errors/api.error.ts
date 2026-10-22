export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);

    if (
      !Number.isInteger(statusCode) ||
      statusCode < 400 ||
      statusCode > 599
    ) {
      throw new RangeError(
        "ApiError statusCode must be an integer between 400 and 599.",
      );
    }

    if (typeof code !== "string" || code.trim().length === 0) {
      throw new TypeError("ApiError code must be a non-empty string.");
    }

    if (typeof message !== "string" || message.trim().length === 0) {
      throw new TypeError("ApiError message must be a non-empty string.");
    }

    this.statusCode = statusCode;
    this.code = code;
    this.name = "ApiError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
